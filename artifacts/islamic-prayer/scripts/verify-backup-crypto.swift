import Foundation

@main
struct BackupCryptoRegression {
    static func expectFailure(_ action: () throws -> Void, _ label: String) {
        do {
            try action()
            fatalError("Expected rejection: \(label)")
        } catch {
            precondition((error as? NuurBackupCrypto.Failure) != nil, "Unexpected error type: \(label)")
        }
    }

    static func mutated(_ envelope: String, _ mutate: (inout [String: Any]) -> Void) throws -> String {
        var object = try JSONSerialization.jsonObject(with: Data(envelope.utf8)) as! [String: Any]
        mutate(&object)
        return String(data: try JSONSerialization.data(withJSONObject: object, options: [.sortedKeys]), encoding: .utf8)!
    }

    static func main() throws {
        // CLI used by the Node runner for independent cross-language vectors.
        if CommandLine.arguments.count == 2 {
            let bytes = FileHandle.standardInput.readDataToEndOfFile()
            let input = try JSONSerialization.jsonObject(with: bytes) as! [String: String]
            let output: String
            if CommandLine.arguments[1] == "encrypt" {
                output = try NuurBackupCrypto.encrypt(plaintext: input["plaintext"]!, passphrase: input["passphrase"]!)
            } else {
                output = try NuurBackupCrypto.decrypt(envelope: input["envelope"]!, passphrase: input["passphrase"]!)
            }
            FileHandle.standardOutput.write(Data(output.utf8))
            return
        }

        let passphrase = "twelve words? نور الله 🤲"
        let plaintext = "{\"journal\":\"اللَّهُ — Café e\u{301} 🤲\",\"zero\":\"\\u0000\"}"
        let envelope = try NuurBackupCrypto.encrypt(plaintext: plaintext, passphrase: passphrase)
        let restored = try NuurBackupCrypto.decrypt(envelope: envelope, passphrase: passphrase)
        precondition(restored == plaintext)
        let again = try NuurBackupCrypto.encrypt(plaintext: plaintext, passphrase: passphrase)
        precondition(again != envelope, "Each backup needs a fresh salt and nonce")
        let firstObject = try JSONSerialization.jsonObject(with: Data(envelope.utf8)) as! [String: Any]
        let secondObject = try JSONSerialization.jsonObject(with: Data(again.utf8)) as! [String: Any]
        precondition(firstObject["salt"] as! String != secondObject["salt"] as! String)
        precondition(firstObject["nonce"] as! String != secondObject["nonce"] as! String)

        let badPassword = "wrong password twelve"
        expectFailure({ _ = try NuurBackupCrypto.decrypt(envelope: envelope, passphrase: badPassword) }, "wrong password")
        expectFailure({ _ = try NuurBackupCrypto.encrypt(plaintext: plaintext, passphrase: "short") }, "short passphrase")
        expectFailure({ _ = try NuurBackupCrypto.encrypt(plaintext: plaintext, passphrase: String(repeating: "a", count: 1025)) }, "password byte bound")
        expectFailure({ _ = try NuurBackupCrypto.encrypt(plaintext: String(repeating: "a", count: NuurBackupCrypto.maximumPlaintextBytes + 1), passphrase: passphrase) }, "plaintext bound")
        expectFailure({ _ = try NuurBackupCrypto.decrypt(envelope: String(repeating: "a", count: NuurBackupCrypto.maximumEnvelopeBytes + 1), passphrase: passphrase) }, "envelope bound")

        for (field, value) in [
            ("format", "wrong" as Any), ("version", 2), ("version", true), ("cipher", "AES-CBC"),
            ("kdf", "SHA256"), ("iterations", 1), ("iterations", 600_001), ("salt", "AA=="),
            ("nonce", "AA=="), ("tag", "AA=="), ("ciphertext", "%%%"), ("unknown", "field")
        ] {
            let tampered = try mutated(envelope) { $0[field] = value }
            expectFailure({ _ = try NuurBackupCrypto.decrypt(envelope: tampered, passphrase: passphrase) }, "header/bounds: \(field)")
        }
        for field in ["salt", "nonce", "ciphertext", "tag"] {
            let tampered = try mutated(envelope) { object in
                var bytes = Data(base64Encoded: object[field] as! String)!
                bytes[0] ^= 1
                object[field] = bytes.base64EncodedString()
            }
            expectFailure({ _ = try NuurBackupCrypto.decrypt(envelope: tampered, passphrase: passphrase) }, "authenticated tamper: \(field)")
        }
        let missing = try mutated(envelope) { $0.removeValue(forKey: "tag") }
        expectFailure({ _ = try NuurBackupCrypto.decrypt(envelope: missing, passphrase: passphrase) }, "missing tag")

        // All decrypt errors share one message, no password-vs-corruption oracle.
        var messages = Set<String>()
        for candidate in [envelope, "not JSON", missing] {
            do { _ = try NuurBackupCrypto.decrypt(envelope: candidate, passphrase: badPassword) }
            catch { messages.insert(error.localizedDescription) }
        }
        precondition(messages.count == 1)
        print("Native backup crypto QA passed: round-trip, Unicode, fresh salt/nonce, tamper rejection, fixed parameters, strict fields, size bounds and generic failures.")
    }
}
