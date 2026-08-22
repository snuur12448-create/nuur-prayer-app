#import <React/RCTBridgeModule.h>
#import <React/RCTEventEmitter.h>

// Exposes NuurBridge.swift methods to JavaScript via React Native's
// Objective-C bridge. Each RCT_EXTERN_METHOD declares the signature; the
// Swift @objc(name:) attribute wires it through.
//
// NuurBridge inherits from RCTEventEmitter so it can push the
// "NuurAdhkarDidUpdate" event into JS whenever the widget extension marks a
// dhikr (via the shared Darwin notification).
@interface RCT_EXTERN_MODULE(NuurBridge, RCTEventEmitter)

RCT_EXTERN_METHOD(writeWidgetData:(NSString *)json
                  resolver:(RCTPromiseResolveBlock)resolver
                  rejecter:(RCTPromiseRejectBlock)rejecter)

RCT_EXTERN_METHOD(reloadWidget:(RCTPromiseResolveBlock)resolver
                  rejecter:(RCTPromiseRejectBlock)rejecter)

RCT_EXTERN_METHOD(refreshWeather:(nonnull NSNumber *)latitude
                  longitude:(nonnull NSNumber *)longitude
                  resolver:(RCTPromiseResolveBlock)resolver
                  rejecter:(RCTPromiseRejectBlock)rejecter)

RCT_EXTERN_METHOD(readAdhkarState:(RCTPromiseResolveBlock)resolver
                  rejecter:(RCTPromiseRejectBlock)rejecter)

RCT_EXTERN_METHOD(markAdhkarRecited:(NSString *)id
                  resolver:(RCTPromiseResolveBlock)resolver
                  rejecter:(RCTPromiseRejectBlock)rejecter)

@end
