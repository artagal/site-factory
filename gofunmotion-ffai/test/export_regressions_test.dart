import 'dart:io';
import 'package:test/test.dart';

// These checks inspect FlutterFlow's output, not just the authoring DSL.
void main() {
  final available = Directory('generated_code/lib').existsSync();
  String page(String name) =>
      File(
        'generated_code/lib/pages/$name/${name}_widget.dart',
      ).readAsStringSync();

  group(
    'Fresh generated marketplace snapshot',
    () {
      test(
        'Browse pages use the approved feed and real listing references',
        () {
          for (final name in ['discover_page', 'deals_page']) {
            final source = page(name);
            expect(source, contains('getOpenDealFeedCall'));
        expect(source.contains('goFunMotionListingReference'), isTrue);
            expect(source, isNot(contains('Demo Clay House')));
            expect(source, isNot(contains('onPressed: () async {}')));
            expect(source, contains('NeverScrollableScrollPhysics'));
          }
        },
      );

      test('Signed-out account gates have working native navigation', () {
        for (final name in [
          'profile_page',
          'partner_dashboard_page',
          'admin_page',
        ]) {
          final source = page(name);
          expect(source, contains('Sign in to your account'));
          expect(
            source,
            contains('context.pushNamed(SignInPageWidget.routeName)'),
          );
          expect(source, isNot(contains('onPressed: () async {}')));
        }
      });

      test(
        'Deal detail guards a missing reference before the Firestore read',
        () {
          final source = page('deal_detail_page');
          final guard = source.indexOf('if (widget!.listingRef != null)');
          final read = source.indexOf('ListingsRecord.getDocumentOnce');
          expect(guard, greaterThanOrEqualTo(0));
          expect(read, greaterThan(guard));
        },
      );

      test(
        'Booking reads the current form and shows a persistent confirmation',
        () {
          final source = page('deal_detail_page');
          final action = source.substring(
            source.indexOf('.createBookingRequestV2Call'),
          );
          for (final field in [
            'requestName',
            'requestEmail',
            'partySize',
            'requestedDate',
            'requestedTime',
          ]) {
            expect(action, contains('_model.${field}FieldTextController.text'));
          }
          expect(source, contains('if (!_model.bookingSent!)'));
          expect(action, contains('_model.bookingSent = true'));
          expect(source, contains('Booking request sent'));
        },
      );

      test('Saved refresh reloads all three account collections', () {
        final source = page('saved_page');
        expect(source, contains('Refresh saved items'));
        for (final call in [
          'getSavedPlansCall',
          'getSavedListingsCall',
          'getMyBookingRequestsCall',
        ]) {
          expect(
            RegExp(call).allMatches(source).length,
            greaterThanOrEqualTo(2),
          );
        }
      });
    },
    skip:
        available
            ? false
            : 'Refresh the FlutterFlow export before this QA gate.',
  );
}
