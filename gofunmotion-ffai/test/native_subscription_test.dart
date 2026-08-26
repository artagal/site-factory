import 'dart:io';

import 'package:test/test.dart';

void main() {
  late String source;

  setUpAll(() {
    source = File('dsl/native_subscription.dart').readAsStringSync();
  });

  test(
    'native billing stays server-authorized and contains no private key',
    () {
      expect(
        source,
        contains("Uri.https('gofunmotion.com', '/api/mobile/subscription'"),
      );
      expect(source, contains('FirebaseAuth.instance.currentUser'));
      expect(source, contains('Purchases.purchase(PurchaseParams.package'));
      expect(source, contains('Purchases.restorePurchases()'));
      expect(source, isNot(contains('REVENUECAT_SECRET_API_KEY')));
      expect(source, isNot(contains('sk_live_')));
      expect(source, isNot(contains('sk_test_')));
    },
  );

  test('subscription UI waits for a non-null store result', () {
    expect(
      source,
      contains("state.ensureField('storeReady', bool_.withDefault(false))"),
    );
    expect(source, contains("SetState('storeReady', true)"));
    expect(source, contains("visible: Equals(State('storeReady'), true)"));
    expect(
      source,
      contains("visible: Equals(State('storeState')['can\${title}'], true)"),
    );
    expect(source, contains('String? businessId, String command, String tier'));
  });

  test('consumer booking language is not replaced by checkout language', () {
    expect(source, contains('Bookings remain requests, not purchases.'));
    expect(source, isNot(contains('Buy Now')));
  });
}
