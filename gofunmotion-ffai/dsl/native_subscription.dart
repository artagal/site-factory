import 'package:flutterflow_ai/flutterflow_ai.dart';
import 'package:flutterflow_ai/src/helpers/data_type_helpers.dart' as types;
import 'package:flutterflow_ai/src/helpers/data_schema_helpers.dart'
    show findDataStruct;
import '../lib/flutterflow_project.dart' as ff;

const nativeStoreActionName = 'goFunMotionStoreSubscription';
const nativeStoreActionDescription =
    'Native store SDK boundary: authenticated business binding, localized prices, purchase, restore and server verification. No UI or private keys.';

void ensureNativeSubscription(App app) {
  final result = app.struct('NativeStoreState', {
    for (final key in [
      'businessId',
      'businessName',
      'tier',
      'periodEnd',
      'message',
      'growthPrice',
      'proPrice',
      'manageUrl',
    ])
      key: string,
    // Keep the persisted field order stable. The two per-plan flags were
    // appended by a one-time migration after the original three flags.
    for (final key in [
      'canPurchase',
      'canRestore',
      'canManage',
      'canGrowth',
      'canPro',
    ])
      key: bool_,
  });
  app.raw((project) {
    final dependency = findPubDependency(project, name: 'purchases_flutter');
    if (dependency == null) {
      addPubDependency(project, name: 'purchases_flutter', version: '9.9.5');
    }
    final existing = findCustomAction(project, name: nativeStoreActionName);
    if (existing != null) {
      updateCustomAction(
        project,
        name: nativeStoreActionName,
        code: nativeStoreActionCode,
        description: nativeStoreActionDescription,
      );
    } else {
      addCustomAction(
        project,
        name: nativeStoreActionName,
        code: nativeStoreActionCode,
        description: nativeStoreActionDescription,
        arguments: [
          for (final name in ['businessId', 'command', 'tier'])
            FFParameter(
              identifier: FFIdentifier(name: name, key: 'gfm_store_$name'),
              dataType: types.stringType,
            ),
        ],
        returnParameter: FFParameter(
          identifier: FFIdentifier(name: 'storeState', key: 'gfm_store_state'),
          dataType: types.dataStructType(
            findDataStruct(project, name: 'NativeStoreState')!.identifier,
          ),
        ),
      );
    }
  });
  final page = ff.Pages.all.singleWhere(
    (page) => page.name == 'PartnerSubscriptionPage',
  );
  app.editPageState(page, (state) {
    state.ensureField('storeState', result);
    state.ensureField('storeBusy', bool_.withDefault(false));
    state.ensureField('storeReady', bool_.withDefault(false));
  });

  List<DslAction> run(
    String command, {
    String tier = '',
    bool initial = false,
  }) {
    final alias = 'store${initial ? 'Initial' : ''}${command}${tier}Result';
    return [
      If(
        Not(State('storeBusy')),
        then: [
          SetState('storeBusy', true),
          CallCustomAction.named(
            nativeStoreActionName,
            args: {'businessId': string, 'command': string, 'tier': string},
            returnType: result,
            outputAs: alias,
            arguments: {
              'businessId':
                  initial
                      ? PageParam('businessId')
                      : State('storeState')['businessId'],
              'command': command,
              'tier': tier,
            },
          ),
          SetState('storeState', ActionOutput(alias)),
          SetState('storeReady', true),
          SetState('storeBusy', false),
        ],
      ),
    ];
  }

  DslWidget plan(String tier, String title, String benefits) => Container(
    name: '${title}StorePlan',
    padding: 16,
    borderRadius: 8,
    color: Colors.secondaryBackground,
    child: Column(
      crossAxis: CrossAxis.start,
      spacing: 12,
      children: [
        Text(title, style: Styles.titleLarge),
        Text(benefits, style: Styles.bodyMedium, color: Colors.secondaryText),
        Text(
          State('storeState')['${tier}Price'],
          style: Styles.headlineSmall,
          visible: Equals(State('storeState')['can${title}'], true),
        ),
        Text(
          'per month',
          style: Styles.bodyMedium,
          visible: Equals(State('storeState')['can${title}'], true),
        ),
        Button(
          'Continue with $title',
          name: '${title}StorePurchaseButton',
          height: 48,
          width: double.infinity,
          borderRadius: 8,
          color: tier == 'growth' ? Colors.tertiary : Colors.primary,
          icon: 'shopping_bag_outlined',
          visible: Equals(State('storeState')['can${title}'], true),
          onTap: run('purchase', tier: tier),
        ),
      ],
    ),
  );

  app.editPageOnLoad(page, run('load', initial: true));
  app.editPage(page, (edit) {
    edit.ensureReplaced(
      page.widgets.all.singleWhere(
        (widget) => widget.name == 'WorkspaceScreenBody',
      ),
      Column(
        name: 'WorkspaceScreenBody',
        crossAxis: CrossAxis.start,
        spacing: 14,
        children: [
          Text(
            'Checking your subscription...',
            name: 'NativeSubscriptionInitialLoading',
            style: Styles.bodyLarge,
            visible: Not(Equals(State('storeReady'), true)),
          ),
          Expanded(
            Column(
              name: 'NativeSubscriptionContent',
              scrollable: true,
              crossAxis: CrossAxis.start,
              spacing: 16,
              children: [
                Text(
                  State('storeState')['businessName'],
                  style: Styles.titleLarge,
                ),
                Text(State('storeState')['tier'], style: Styles.titleMedium),
                Text(
                  State('storeState')['periodEnd'],
                  style: Styles.bodyMedium,
                  visible: Not(Equals(State('storeState')['periodEnd'], '')),
                ),
                Text(
                  'Checking your subscription...',
                  name: 'StoreLoadingStatus',
                  style: Styles.bodyMedium,
                  visible: Equals(State('storeBusy'), true),
                ),
                Text(
                  State('storeState')['message'],
                  name: 'StoreResultMessage',
                  style: Styles.bodyLarge,
                  visible: Not(Equals(State('storeState')['message'], '')),
                ),
                plan(
                  'growth',
                  'Growth',
                  '10 active deals, analytics and featured eligibility.',
                ),
                plan(
                  'pro',
                  'Pro',
                  'Unlimited active deals, advanced analytics and team roster.',
                ),
                Button(
                  'Manage subscription',
                  name: 'ManageNativeSubscriptionButton',
                  icon: 'settings_outlined',
                  height: 48,
                  width: double.infinity,
                  borderRadius: 8,
                  variant: ButtonVariant.outlined,
                  visible: Equals(State('storeState')['canManage'], true),
                  onTap: LaunchUrl(State('storeState')['manageUrl']),
                ),
                Button(
                  'Restore purchases',
                  name: 'RestoreNativePurchasesButton',
                  icon: 'restore',
                  height: 48,
                  width: double.infinity,
                  borderRadius: 8,
                  variant: ButtonVariant.outlined,
                  visible: Equals(State('storeState')['canRestore'], true),
                  onTap: run('restore'),
                ),
                Button(
                  'Refresh status',
                  name: 'RefreshNativeSubscriptionButton',
                  icon: 'refresh',
                  height: 48,
                  width: double.infinity,
                  borderRadius: 8,
                  variant: ButtonVariant.outlined,
                  visible: Not(State('storeBusy')),
                  onTap: run('load'),
                ),
                Text(
                  'Monthly subscription. Payment is charged to your store account after confirmation. It renews automatically unless cancelled in your store account settings. Cancellation keeps access until the paid period ends.',
                  style: Styles.bodyMedium,
                  color: Colors.secondaryText,
                ),
                Text(
                  'One subscription covers one approved business. Bookings remain requests, not purchases.',
                  style: Styles.bodyMedium,
                  color: Colors.secondaryText,
                ),
                Button(
                  'Terms of Use',
                  height: 44,
                  variant: ButtonVariant.text,
                  onTap: LaunchUrl('https://gofunmotion.com/terms'),
                ),
                Button(
                  'Privacy Policy',
                  height: 44,
                  variant: ButtonVariant.text,
                  onTap: LaunchUrl('https://gofunmotion.com/privacy'),
                ),
                Button(
                  'Billing support',
                  height: 44,
                  variant: ButtonVariant.text,
                  onTap: Navigate(
                    ff.Pages.all.singleWhere(
                      (page) => page.name == 'SupportPage',
                    ),
                    params: {
                      'id': '',
                      'businessId': State('storeState')['businessId'],
                    },
                  ),
                ),
              ],
            ),
            visible: Equals(State('storeReady'), true),
          ),
        ],
      ),
    );
  });
}

const nativeStoreActionCode = r'''
import 'dart:convert';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:flutter/foundation.dart';
import 'package:flutter/services.dart';
import 'package:http/http.dart' as http;
import 'package:purchases_flutter/purchases_flutter.dart';

bool _goFunMotionStoreBusy = false;

class _GoFunMotionStoreError implements Exception {
  const _GoFunMotionStoreError(this.message);
  final String message;
}

Future<Map<String, dynamic>> _goFunMotionBillingRequest(
  String uid, String businessId, String platform, [String? action]
) async {
  final user = FirebaseAuth.instance.currentUser;
  if (user == null || user.uid != uid) {
    throw const _GoFunMotionStoreError('Sign in again before managing your subscription.');
  }
  final token = await user.getIdToken();
  final headers = {'Authorization': 'Bearer $token', 'Content-Type': 'application/json'};
  final uri = Uri.https('gofunmotion.com', '/api/mobile/subscription',
    action == null ? {'businessId': businessId, 'platform': platform} : null);
  final response = await (action == null
    ? http.get(uri, headers: headers)
    : http.post(uri, headers: headers, body: jsonEncode({'businessId': businessId, 'platform': platform, 'action': action})))
    .timeout(const Duration(seconds: 25));
  if (FirebaseAuth.instance.currentUser?.uid != uid) {
    throw const _GoFunMotionStoreError('Your account changed. Reopen the subscription screen.');
  }
  final decoded = jsonDecode(response.body);
  if (decoded is! Map<String, dynamic>) {
    throw const _GoFunMotionStoreError('Subscription services are temporarily unavailable.');
  }
  if (response.statusCode < 200 || response.statusCode >= 300 || decoded['ok'] != true) {
    throw _GoFunMotionStoreError(decoded['error'] is String ? decoded['error'] as String : 'The subscription could not be verified.');
  }
  return decoded;
}

void _goFunMotionApplyStoreStatus(NativeStoreStateStruct result, Map<String, dynamic> data) {
  final tier = data['pricingTier'];
  result.tier = tier == 'pro' ? 'Current plan: Pro' : tier == 'growth' ? 'Current plan: Growth' : 'Current plan: Starter';
  final end = DateTime.tryParse(data['subscriptionCurrentPeriodEnd']?.toString() ?? '')?.toLocal();
  result.periodEnd = end == null ? '' : 'Paid through ${end.year}-${end.month.toString().padLeft(2, '0')}-${end.day.toString().padLeft(2, '0')}';
  result.canManage = data['paidAccessEnabled'] == true && ['app_store', 'play_store'].contains(data['subscriptionProvider']);
  result.manageUrl = data['subscriptionProvider'] == 'play_store'
    ? 'https://play.google.com/store/account/subscriptions' : 'https://apps.apple.com/account/subscriptions';
}

Future<NativeStoreStateStruct> goFunMotionStoreSubscription(String? businessId, String command, String tier) async {
  final requestedBusinessId = businessId?.trim() ?? '';
  final result = NativeStoreStateStruct(businessId: requestedBusinessId, tier: 'Starter',
      canPurchase: false, canGrowth: false, canPro: false,
      canRestore: false, canManage: false);
  if (_goFunMotionStoreBusy) {
    result.message = 'A store action is already in progress.';
    return result;
  }
  if (kIsWeb || ![TargetPlatform.iOS, TargetPlatform.android].contains(defaultTargetPlatform)) {
    result.message = 'Mobile subscriptions are available in the iOS and Android apps. Starter remains free.';
    return result;
  }
  final uid = FirebaseAuth.instance.currentUser?.uid;
  if (uid == null) {
    result.message = 'Sign in with your business account to manage a subscription.';
    return result;
  }
  _goFunMotionStoreBusy = true;
  final platform = defaultTargetPlatform == TargetPlatform.iOS ? 'ios' : 'android';
  try {
    final config = await _goFunMotionBillingRequest(uid, requestedBusinessId, platform);
    result.businessId = config['businessId'] as String? ?? requestedBusinessId;
    result.businessName = config['businessName'] as String? ?? 'Your business';
    _goFunMotionApplyStoreStatus(result, config);
    result.message = config['message'] as String? ?? '';
    if (config['available'] != true) return result;
    final key = config['publicSdkKey'] as String? ?? '';
    if (!key.startsWith(platform == 'ios' ? 'appl_' : 'goog_') || config['appUserId'] != uid) {
      throw const _GoFunMotionStoreError('Store configuration could not be verified.');
    }
    if (!await Purchases.isConfigured) {
      await Purchases.setLogLevel(LogLevel.error);
      await Purchases.configure(PurchasesConfiguration(key)..appUserID = uid);
    } else if (await Purchases.appUserID != uid) {
      await Purchases.logIn(uid);
    }
    if (await Purchases.appUserID != uid || FirebaseAuth.instance.currentUser?.uid != uid) {
      throw const _GoFunMotionStoreError('Your store account could not be linked.');
    }
    result.canRestore = true;
    final offerings = command == 'restore' ? null : await Purchases.getOfferings();
    final offering = offerings?.all['partner_plans'];
    final packages = <String, Package>{};
    for (final name in ['growth', 'pro']) {
      for (final package in offering?.availablePackages ?? <Package>[]) {
        final product = package.storeProduct;
        if (package.identifier == '${name}_monthly'
          && (product.identifier == 'com.gofunmotion.app.$name.monthly' || product.identifier == 'com.gofunmotion.app.$name.monthly:monthly')
          && product.subscriptionPeriod == 'P1M') {
          packages[name] = package;
        }
      }
    }
    result.growthPrice = packages['growth']?.storeProduct.priceString ?? '';
    result.proPrice = packages['pro']?.storeProduct.priceString ?? '';
    result.canPurchase = config['paidAccessEnabled'] != true && packages.isNotEmpty;
    result.canGrowth = result.canPurchase && packages.containsKey('growth');
    result.canPro = result.canPurchase && packages.containsKey('pro');
    if (command == 'load') {
      if (packages.isEmpty) {
        result.message = 'Store plans are not available yet. No payment has been started.';
      }
      return result;
    }
    if (command != 'purchase' && command != 'restore') {
      throw const _GoFunMotionStoreError('Choose a subscription action.');
    }
    if (command == 'purchase' && (!result.canPurchase || !packages.containsKey(tier))) {
      throw const _GoFunMotionStoreError('This plan is not available. Refresh your store prices.');
    }
    await _goFunMotionBillingRequest(uid, result.businessId, platform, 'prepare');
    if (await Purchases.appUserID != uid || FirebaseAuth.instance.currentUser?.uid != uid) {
      throw const _GoFunMotionStoreError('Your account changed. No purchase was started.');
    }
    if (command == 'restore') {
      await Purchases.restorePurchases();
    } else {
      await Purchases.purchase(PurchaseParams.package(packages[tier]!));
    }
    result.canPurchase = false;
    result.canGrowth = false;
    result.canPro = false;
    final verified = await _goFunMotionBillingRequest(uid, result.businessId, platform, 'sync');
    _goFunMotionApplyStoreStatus(result, verified);
    result.message = verified['message'] as String? ?? 'Subscription status refreshed.';
  } on PlatformException catch (error) {
    final code = PurchasesErrorHelper.getErrorCode(error);
    result.message = code == PurchasesErrorCode.purchaseCancelledError
      ? 'Purchase cancelled. Your plan has not changed.'
      : code == PurchasesErrorCode.paymentPendingError
        ? 'Payment is pending store approval. Do not purchase again; refresh the status later.'
        : 'The store could not finish this action. Use Restore purchases or try again.';
    if (code == PurchasesErrorCode.paymentPendingError) {
      result.canPurchase = false;
      result.canGrowth = false;
      result.canPro = false;
    }
  } on _GoFunMotionStoreError catch (error) {
    result.message = error.message;
  } catch (_) {
    result.message = 'Subscription verification is unavailable. If you paid, use Restore purchases; do not pay again.';
    result.canPurchase = false;
    result.canGrowth = false;
    result.canPro = false;
  } finally {
    _goFunMotionStoreBusy = false;
  }
  return result;
}
''';
