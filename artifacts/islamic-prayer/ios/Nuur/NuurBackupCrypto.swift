import Foundation
import CryptoKit
import CommonCrypto
import Security
import CoreFoundation

/// Portable, password-encrypted backup envelope. No password/key is persisted.
/// Use off the main queue: the deliberately expensive KDF must not block UI.
enum NuurBackupCrypto {
    static let maximumPlaintextBytes = 2 * 1024 * 1024
    static let maximumEnvelopeBytes = 3 * 1024 * 1024
    private static let iterations: UInt32 = 600_000
    private static let format = "nuur-backup"
    private static let cipher = "AES-256-GCM"
    private static let kdf = "PBKDF2-HMAC-SHA256"
    private static let authenticatedHeader = Data("nuur-backup|1|PBKDF2-HMAC-SHA256|600000|AES-256-GCM".utf8)
    private static let fields: Set<String> = ["format", "version", "cipher", "kdf", "iterations", "salt", "nonce", "ciphertext", "tag"]

    enum Failure: LocalizedError {
        case invalidPassphrase
        case tooLarge
        case encryptionFailed
        case cannotDecrypt

        var errorDescription: String? {
            switch self {
            case .invalidPassphrase:
                return "Use a passphrase of at least 12 characters and no more than 1,024 UTF-8 bytes."
            case .tooLarge:
                return "The backup exceeds the supported size."
            case .encryptionFailed:
                return "The backup could not be encrypted. Please try again."
            case .cannotDecrypt:
                // Do not expose whether a password, tag, header, or payload was
                // wrong. Never return unauthenticated or partially decoded data.
                return "The backup could not be opened. Check the passphrase and use an unmodified Nuur backup."
            }
        }
    }

    static func encrypt(plaintext: String, passphrase: String) throws -> String {
        try validatePassphrase(passphrase)
        guard plaintext.utf8.count <= maximumPlaintextBytes else { throw Failure.tooLarge }
        let salt = try randomBytes(count: 16)
        let nonceData = try randomBytes(count: 12)
        let key = try deriveKey(passphrase: passphrase, salt: salt)
        do {
            let sealed = try AES.GCM.seal(
                Data(plaintext.utf8),
                using: key,
                nonce: AES.GCM.Nonce(data: nonceData),
                authenticating: authenticatedHeader
            )
            let object: [String: Any] = [
                "format": format,
                "version": 1,
                "cipher": cipher,
                "kdf": kdf,
                "iterations": iterations,
                "salt": salt.base64EncodedString(),
                "nonce": nonceData.base64EncodedString(),
                "ciphertext": sealed.ciphertext.base64EncodedString(),
                "tag": sealed.tag.base64EncodedString(),
            ]
            let encoded = try JSONSerialization.data(withJSONObject: object, options: [.sortedKeys, .withoutEscapingSlashes])
            guard encoded.count <= maximumEnvelopeBytes, let text = String(data: encoded, encoding: .utf8) else {
                throw Failure.encryptionFailed
            }
            return text
        } catch {
            throw Failure.encryptionFailed
        }
    }

    static func decrypt(envelope: String, passphrase: String) throws -> String {
        do {
            // Bound hostile input before allocating base64 buffers or running
            // the KDF. Parameters are fixed, never attacker-supplied work sizes.
            guard envelope.utf8.count <= maximumEnvelopeBytes else { throw Failure.cannotDecrypt }
            try validatePassphrase(passphrase)
            guard let object = try JSONSerialization.jsonObject(with: Data(envelope.utf8)) as? [String: Any],
                  Set(object.keys) == fields,
                  object["format"] as? String == format,
                  object["cipher"] as? String == cipher,
                  object["kdf"] as? String == kdf,
                  exactInteger(object["version"], equals: 1),
                  exactInteger(object["iterations"], equals: Int(iterations)),
                  let salt = decodeBase64(object["salt"], maximumBytes: 16), salt.count == 16,
                  let nonce = decodeBase64(object["nonce"], maximumBytes: 12), nonce.count == 12,
                  let tag = decodeBase64(object["tag"], maximumBytes: 16), tag.count == 16,
                  let ciphertext = decodeBase64(object["ciphertext"], maximumBytes: maximumPlaintextBytes)
            else { throw Failure.cannotDecrypt }

            let key = try deriveKey(passphrase: passphrase, salt: salt)
            let sealed = try AES.GCM.SealedBox(nonce: AES.GCM.Nonce(data: nonce), ciphertext: ciphertext, tag: tag)
            let plaintext = try AES.GCM.open(sealed, using: key, authenticating: authenticatedHeader)
            guard plaintext.count <= maximumPlaintextBytes, let text = String(data: plaintext, encoding: .utf8) else {
                throw Failure.cannotDecrypt
            }
            return text
        } catch {
            throw Failure.cannotDecrypt
        }
    }

    private static func validatePassphrase(_ passphrase: String) throws {
        guard passphrase.utf8.count <= 1024, passphrase.count >= 12 else { throw Failure.invalidPassphrase }
    }

    private static func exactInteger(_ value: Any?, equals expected: Int) -> Bool {
        guard let number = value as? NSNumber, CFGetTypeID(number) != CFBooleanGetTypeID() else { return false }
        return number.doubleValue == Double(expected)
    }

    private static func decodeBase64(_ value: Any?, maximumBytes: Int) -> Data? {
        guard let text = value as? String,
              text.utf8.count <= ((maximumBytes + 2) / 3) * 4,
              let bytes = Data(base64Encoded: text),
              bytes.count <= maximumBytes,
              bytes.base64EncodedString() == text
        else { return nil }
        return bytes
    }

    private static func randomBytes(count: Int) throws -> Data {
        var bytes = Data(count: count)
        let result = bytes.withUnsafeMutableBytes { buffer in
            SecRandomCopyBytes(kSecRandomDefault, count, buffer.baseAddress!)
        }
        guard result == errSecSuccess else { throw Failure.encryptionFailed }
        return bytes
    }

    private static func deriveKey(passphrase: String, salt: Data) throws -> SymmetricKey {
        // Preserve exact UTF-8, including non-ASCII and embedded NUL. No trim or
        // Unicode normalization may silently change a user's password.
        var password = Data(passphrase.utf8)
        var derived = Data(count: 32)
        let passwordCount = password.count
        let saltCount = salt.count
        let keyCount = derived.count
        defer {
            password.resetBytes(in: 0..<password.count)
            derived.resetBytes(in: 0..<derived.count)
        }
        let status = password.withUnsafeBytes { passwordBytes in
            salt.withUnsafeBytes { saltBytes in
                derived.withUnsafeMutableBytes { keyBytes in
                    CCKeyDerivationPBKDF(
                        CCPBKDFAlgorithm(kCCPBKDF2),
                        passwordBytes.baseAddress!.assumingMemoryBound(to: CChar.self), passwordCount,
                        saltBytes.baseAddress!.assumingMemoryBound(to: UInt8.self), saltCount,
                        CCPseudoRandomAlgorithm(kCCPRFHmacAlgSHA256), iterations,
                        keyBytes.baseAddress!.assumingMemoryBound(to: UInt8.self), keyCount
                    )
                }
            }
        }
        guard status == kCCSuccess else { throw Failure.encryptionFailed }
        return SymmetricKey(data: derived)
    }
}
