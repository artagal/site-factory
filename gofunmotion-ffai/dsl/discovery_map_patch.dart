import 'package:flutterflow_ai/flutterflow_ai.dart';
import 'package:flutterflow_ai/src/helpers/tree_helpers.dart'
    show findDescendants;
import '../lib/flutterflow_project.dart' as ff;

const examplePageName = 'ExampleActivityPage';
const exampleBrowseName = 'ExampleActivitiesPage';

final discoveryOffer = StructHandle(
  'DiscoveryOfferV1',
  {
    for (final key in [
      'id',
      'listingId',
      'title',
      'businessName',
      'cityId',
      'cityName',
      'description',
      'imageUrl',
      'priceLabel',
      'wasLabel',
      'discountLabel',
      'timeLabel',
      'spotsLabel',
      'durationLabel',
      'groupLabel',
      'environmentLabel',
      'terms',
      'locationLabel',
    ])
      key: string,
    'isDemo': bool_,
    'canRequestBooking': bool_,
    'hasLocation': bool_,
  },
  description:
      'Public discovery offer. Examples never contain a bookable listing reference.',
);
final discoveryResponse = StructHandle(
  'DiscoveryCatalogV1',
  {
    'cards': listOf(discoveryOffer),
    'cities': listOf(ff.Structs.mobileAssistantCity),
    'empty': bool_,
    'isDemo': bool_,
    'mapUrl': string,
    'notice': string,
  },
  description:
      'Separated live or example activity catalog with canonical cities.',
);
final discoveryEndpoint = Endpoint.get(
  'GetDiscoveryCatalogV1',
  '/api/mobile/discovery?catalog=[catalog]&cityId=[cityId]&id=[id]',
  variables: {'catalog': string, 'cityId': string, 'id': string},
  response: discoveryResponse,
  settings: const EndpointSettings(decodeUtf8: true),
)..attachToGroup('GoFunMotionDiscovery');

final listingReference = CustomFunctionHandle(
  name: 'goFunMotionListingReference',
  args: {'listingId': string},
  returnType: docRef(ff.Collections.listings),
);

Object discoveryPage(String name) =>
    ff.Pages.all.where((page) => page.name == name).firstOrNull ?? name;

Map<String, DslType> discoveryState({bool examples = false}) => {
  'discoveryView': string.withDefault('loading'),
  'discoveryCatalog': string.withDefault(examples ? 'examples' : 'live'),
  'discoveryCityId': string.withDefault(''),
  'discoveryCityLabel': string.withDefault('All cities'),
  'discoveryCitiesOpen': bool_.withDefault(false),
  'discoveryEmpty': bool_.withDefault(false),
  'discoveryMapUrl': string.withDefault(
    'https://gofunmotion.com/maps/deals.html?catalog=${examples ? 'examples' : 'live'}',
  ),
  'discoveryNotice': string.withDefault(''),
  'discoveryCards': listOf(discoveryOffer),
  'discoveryCities': listOf(ff.Structs.mobileAssistantCity),
};

List<DslAction> loadDiscovery(String prefix, {bool detail = false}) => [
  SetState('discoveryView', 'loading'),
  SetState('discoveryEmpty', false),
  ApiCall(
    discoveryEndpoint,
    outputAs: '${prefix}DiscoveryResponse',
    params: {
      'catalog': State('discoveryCatalog'),
      'cityId': State('discoveryCityId'),
      'id': detail ? const PageParam('id') : '',
    },
    onSuccess:
        (response) => [
          SetState('discoveryCards', response['cards']),
          SetState('discoveryCities', response['cities']),
          SetState('discoveryEmpty', response['empty']),
          SetState('discoveryMapUrl', response['mapUrl']),
          SetState('discoveryNotice', response['notice']),
          SetState('discoveryView', 'ready'),
        ],
    onFailure: [SetState('discoveryView', 'error')],
  ),
];

DslWidget discoveryFeedback({bool detail = false}) => Column(
  name: 'DiscoveryFeedback',
  crossAxis: CrossAxis.start,
  spacing: 8,
  children: [
    Text(
      'Loading offers...',
      visible: Equals(State('discoveryView'), 'loading'),
      style: Styles.bodyMedium,
    ),
    Column(
      visible: Equals(State('discoveryView'), 'error'),
      crossAxis: CrossAxis.start,
      spacing: 8,
      children: [
        Text(
          'Offers could not load. Please try again.',
          style: Styles.bodyMedium,
        ),
        Button(
          'Retry',
          height: 48,
          icon: 'refresh',
          onTap: loadDiscovery(
            detail ? 'detailRetry' : 'catalogRetry',
            detail: detail,
          ),
        ),
      ],
    ),
    Column(
      visible: State('discoveryEmpty'),
      crossAxis: CrossAxis.start,
      spacing: 8,
      children: [
        Text(
          detail
              ? 'This example is unavailable'
              : 'No open deals in this area yet',
          style: Styles.titleMedium,
        ),
        if (!detail) ...[
          Text(
            'Try another city, explore examples, or get notified when deals arrive.',
            style: Styles.bodyMedium,
            color: Colors.secondaryText,
          ),
          Button(
            'Explore examples',
            height: 48,
            icon: 'visibility_outlined',
            variant: ButtonVariant.outlined,
            onTap: Navigate(discoveryPage(exampleBrowseName)),
          ),
          Button(
            'Join city waitlist',
            height: 48,
            icon: 'notifications_none',
            variant: ButtonVariant.text,
            onTap: Navigate(ff.Pages.waitlistPage),
          ),
        ],
      ],
    ),
  ],
);

DslWidget discoveryCityChooser() => Column(
  crossAxis: CrossAxis.start,
  spacing: 8,
  children: [
    Button(
      State('discoveryCityLabel'),
      name: 'DiscoveryCityButton',
      icon: 'location_on_outlined',
      height: 48,
      width: double.infinity,
      variant: ButtonVariant.outlined,
      onTap: SetState.toggle('discoveryCitiesOpen'),
    ),
    Container(
      visible: State('discoveryCitiesOpen'),
      height: 220,
      padding: 8,
      color: Colors.secondaryBackground,
      borderRadius: 8,
      child: Column(
        spacing: 4,
        children: [
          Button(
            'All cities',
            height: 44,
            width: double.infinity,
            variant: ButtonVariant.text,
            onTap: [
              SetState('discoveryCityId', ''),
              SetState('discoveryCityLabel', 'All cities'),
              SetState('discoveryCitiesOpen', false),
              ...loadDiscovery('allCities'),
            ],
          ),
          Expanded(
            ListView(
              name: 'DiscoveryCityOptions',
              source: State('discoveryCities'),
              spacing: 4,
              itemBuilder:
                  (city) => Button(
                    city['label'],
                    height: 48,
                    width: double.infinity,
                    variant: ButtonVariant.text,
                    onTap: [
                      SetState('discoveryCityId', city['id']),
                      SetState('discoveryCityLabel', city['label']),
                      SetState('discoveryCitiesOpen', false),
                      ...loadDiscovery('selectedCity'),
                    ],
                  ),
            ),
          ),
        ],
      ),
    ),
  ],
);

DslWidget offerCard(DslExpression offer, {bool detail = false}) => Container(
  name: detail ? 'ExampleActivityDetails' : 'DiscoveryOfferCard',
  width: double.infinity,
  borderRadius: 8,
  borderWidth: 1,
  borderColor: Colors.alternate,
  color: Colors.secondaryBackground,
  child: Column(
    crossAxis: CrossAxis.start,
    children: [
      Image(
        offer['imageUrl'],
        width: double.infinity,
        height: detail ? 210 : 140,
        fit: ImageFit.cover,
        borderRadius: 8,
        visible: Not(Equals(offer['imageUrl'], '')),
      ),
      Container(
        padding: 16,
        child: Column(
          crossAxis: CrossAxis.start,
          spacing: 10,
          children: [
            Row(
              spacing: 8,
              children: [
                Icon(
                  'local_activity_outlined',
                  color: Colors.secondary,
                  size: 22,
                ),
                Expanded(
                  Text(
                    offer['cityName'],
                    style: Styles.labelMedium,
                    color: Colors.secondaryText,
                  ),
                ),
                Text(
                  offer['discountLabel'],
                  style: Styles.labelMedium,
                  color: Colors.tertiary,
                ),
              ],
            ),
            Text(
              'EXAMPLE / NOT BOOKABLE',
              style: Styles.labelSmall,
              color: Colors.secondary,
              visible: offer['isDemo'],
            ),
            Text(
              offer['title'],
              style: detail ? Styles.headlineSmall : Styles.titleMedium,
              maxLines: detail ? 4 : 3,
            ),
            Text(
              offer['businessName'],
              style: Styles.bodyMedium,
              color: Colors.secondaryText,
            ),
            Row(
              spacing: 12,
              children: [
                Text(
                  offer['priceLabel'],
                  style: Styles.headlineSmall,
                  color: Colors.tertiary,
                ),
                Expanded(
                  Text(
                    offer['wasLabel'],
                    style: Styles.bodyMedium,
                    color: Colors.secondaryText,
                  ),
                ),
              ],
            ),
            Row(
              spacing: 8,
              children: [
                Icon('schedule', size: 18, color: Colors.secondary),
                Expanded(Text(offer['timeLabel'], style: Styles.bodyMedium)),
              ],
            ),
            Row(
              spacing: 8,
              children: [
                Icon('group_outlined', size: 18, color: Colors.secondary),
                Expanded(Text(offer['spotsLabel'], style: Styles.bodyMedium)),
              ],
            ),
            if (detail) ...[
              Text('About the activity', style: Styles.titleMedium),
              Text(offer['description'], style: Styles.bodyLarge),
              Text(offer['durationLabel'], style: Styles.bodyMedium),
              Text(offer['groupLabel'], style: Styles.bodyMedium),
              Text(offer['environmentLabel'], style: Styles.bodyMedium),
              Text(
                offer['locationLabel'],
                style: Styles.bodyMedium,
                color: Colors.secondaryText,
              ),
              Text('Example offer terms', style: Styles.titleMedium),
              Text(offer['terms'], style: Styles.bodyMedium),
              Text(
                'This is an illustrative activity, not a real partner offer. No booking or payment is available.',
                style: Styles.bodyMedium,
                color: Colors.secondary,
              ),
              Button(
                'Browse real deals',
                height: 48,
                width: double.infinity,
                icon: 'local_offer_outlined',
                color: Colors.tertiary,
                textColor: Colors.hex(0xFF101510),
                onTap: Navigate(ff.Pages.dealsPage),
              ),
            ] else ...[
              Button(
                'View example',
                name: 'OpenExampleActivity',
                height: 48,
                width: double.infinity,
                icon: 'arrow_forward',
                variant: ButtonVariant.outlined,
                visible: offer['isDemo'],
                onTap: Navigate(
                  discoveryPage(examplePageName),
                  params: {'id': offer['id']},
                ),
              ),
              Button(
                'View deal',
                name: 'OpenLiveMapDeal',
                height: 48,
                width: double.infinity,
                icon: 'arrow_forward',
                color: Colors.tertiary,
                textColor: Colors.hex(0xFF101510),
                visible: offer['canRequestBooking'],
                onTap: Navigate(
                  ff.Pages.dealDetailPage,
                  params: {
                    'listingRef': CustomFunction(
                      listingReference,
                      args: {'listingId': offer['listingId']},
                    ),
                  },
                ),
              ),
            ],
          ],
        ),
      ),
    ],
  ),
);

DslWidget discoveryBody({bool map = false, bool detail = false}) => Column(
  name: 'DiscoveryScreenBody',
  scrollable: true,
  crossAxis: CrossAxis.start,
  padding: 16,
  spacing: 12,
  children: [
    if (!detail) ...[
      if (map)
        Row(
          spacing: 8,
          children: [
            Expanded(
              Button(
                'Live deals',
                height: 46,
                icon: 'local_offer_outlined',
                variant: ButtonVariant.outlined,
                onTap: [
                  SetState('discoveryCatalog', 'live'),
                  SetState('discoveryCityId', ''),
                  SetState('discoveryCityLabel', 'All cities'),
                  ...loadDiscovery('liveMap'),
                ],
              ),
            ),
            Expanded(
              Button(
                'Examples',
                height: 46,
                icon: 'visibility_outlined',
                variant: ButtonVariant.outlined,
                onTap: [
                  SetState('discoveryCatalog', 'examples'),
                  SetState('discoveryCityId', ''),
                  SetState('discoveryCityLabel', 'All cities'),
                  ...loadDiscovery('exampleMap'),
                ],
              ),
            ),
          ],
        ),
      discoveryCityChooser(),
      Text(
        State('discoveryNotice'),
        style: Styles.bodySmall,
        color: Colors.secondaryText,
      ),
      if (map)
        Container(
          name: 'AlwaysVisibleActivityMap',
          height: 300,
          width: double.infinity,
          borderRadius: 8,
          child: WebView(
            name: 'ActivityMapCanvas',
            url: State('discoveryMapUrl'),
            height: 300,
          ),
        ),
    ],
    discoveryFeedback(detail: detail),
    ListView(
      name: 'DiscoveryOfferList',
      source: State('discoveryCards'),
      shrinkWrap: true,
      spacing: 12,
      visible: Equals(State('discoveryView'), 'ready'),
      itemBuilder: (offer) => offerCard(offer, detail: detail),
    ),
    if (!detail)
      Button(
        'Refresh offers',
        height: 48,
        icon: 'refresh',
        variant: ButtonVariant.text,
        onTap: loadDiscovery('refreshOffers'),
      ),
    Spacer(height: 16),
  ],
);

void buildDiscoveryMapPatch(App app, {bool includeExamplePages = true}) {
  app.struct(
    discoveryOffer.name,
    discoveryOffer.fields,
    description: discoveryOffer.description,
  );
  app.struct(
    discoveryResponse.name,
    discoveryResponse.fields,
    description: discoveryResponse.description,
  );
  app.apiGroup(
    'GoFunMotionDiscovery',
    baseUrl: 'https://gofunmotion.com',
    endpoints: [discoveryEndpoint],
  );
  for (final detail in [false, true]) {
    if (!includeExamplePages) continue;
    final name = detail ? examplePageName : exampleBrowseName;
    app.ensurePage(
      name,
      route: detail ? '/example-activity' : '/example-activities',
      description:
          detail
              ? 'Native example activity detail. No save, booking or payment actions.'
              : 'Opt-in, clearly labeled example activities in five cities.',
      params: {'id': string.withDefault('')},
      state: discoveryState(examples: true),
      onLoad: loadDiscovery(
        detail ? 'exampleDetailLoad' : 'exampleBrowseLoad',
        detail: detail,
      ),
      body: Scaffold(
        appBar: AppBar(title: detail ? 'Example activity' : 'Explore examples'),
        body: discoveryBody(detail: detail),
      ),
    );
  }
  app.editPageState(ff.Pages.dealsMapPage, (state) {
    for (final field in discoveryState().entries)
      state.ensureField(field.key, field.value);
  });
  app.editPageOnLoad(ff.Pages.dealsMapPage, loadDiscovery('mapInitial'));
  app.editPage(ff.Pages.dealsMapPage, (page) {
    page.ensureReplaced(
      page.findByKey(
        ff.Pages.dealsMapPage.widgets.root.slots['body']!.single.key,
      ),
      discoveryBody(map: true),
    );
  });
  for (final handle in [ff.Pages.discoverPage, ff.Pages.dealsPage]) {
    app.editPage(handle, (page) {
      final entry = Row(
        name: 'DiscoveryMapEntry',
        spacing: 8,
        children: [
          Expanded(
            Button(
              'Map',
              name: 'OpenActivityMap',
              height: 48,
              icon: 'map_outlined',
              variant: ButtonVariant.outlined,
              onTap: Navigate(
                ff.Pages.dealsMapPage,
                params: {'id': '', 'businessId': ''},
              ),
            ),
          ),
          Expanded(
            Button(
              'Examples',
              name: 'OpenExampleCatalog',
              height: 48,
              icon: 'visibility_outlined',
              variant: ButtonVariant.outlined,
              onTap: Navigate(discoveryPage(exampleBrowseName)),
            ),
          ),
        ],
      );
      final existing = handle.widgets.all.where(
        (widget) => widget.name == 'DiscoveryMapEntry',
      );
      if (existing.isNotEmpty) {
        page.ensureReplaced(page.findByKey(existing.single.key), entry);
      } else {
        page.ensureInsertedBefore(
          page.findByKey(
            handle.widgets.all
                .singleWhere(
                  (widget) => widget.name == 'MarketplaceBrowsePanel',
                )
                .key,
          ),
          entry,
        );
      }
    });
  }
  app.bottomNav(
    items: [
      BottomNavItem(ff.Pages.discoverPage, icon: 'home_outlined'),
      BottomNavItem(ff.Pages.dealsMapPage, icon: 'map_outlined'),
      BottomNavItem(ff.Pages.dealsPage, icon: 'local_offer_outlined'),
      BottomNavItem(ff.Pages.savedPage, icon: 'bookmark_border'),
      BottomNavItem(ff.Pages.profilePage, icon: 'person_outline'),
    ],
    style: BottomNavStyle.flutter,
    backgroundColor: Colors.secondaryBackground,
    selectedColor: Colors.tertiary,
    unselectedColor: Colors.secondaryText,
  );
  app.raw((project) {
    final navigation = {
      'DiscoverPage': 'Home',
      'DealsMapPage': 'Map',
      'DealsPage': 'Deals',
      'SavedPage': 'Saved',
      'ProfilePage': 'Account',
    };
    project.navBar.pageKeyRefOrder.clear();
    for (final key in project.pageKeys) {
      final page = project.widgetClasses[key]!;
      if (!page.node.props.scaffold.navBarItem.show &&
          !navigation.containsKey(page.name))
        continue;
      final nav = page.node.props.scaffold.ensureNavBarItem();
      nav.show = navigation.containsKey(page.name);
      if (!nav.show) nav.alwaysShowNavBar = false;
    }
    for (final entry in navigation.entries) {
      final page = findPage(project, name: entry.key)!;
      page.node.props.scaffold.navBarItem
        ..alwaysShowNavBar = true
        ..label = FFText(textValue: FFStringValue(inputValue: entry.value));
      project.navBar.pageKeyRefOrder.add(
        FFNodeKeyReference(key: page.node.key),
      );
    }
    for (final name in [
      ff.Pages.dealsMapPage.name,
      examplePageName,
      exampleBrowseName,
    ]) {
      final page = findPage(project, name: name)!;
      for (final bar in findDescendants(
        page.node,
        (node) => node.type == FFWidgetType.AppBar,
      )) {
        bar.props.appBar.backButtonColorValue = FFColorValue(
          inputValue: FFColor(themeColor: FFColor_ThemeColor.PRIMARY_TEXT),
        );
      }
      final loading =
          findDescendants(
            page.node,
            (node) =>
                node.type == FFWidgetType.Text &&
                node.props.text.textValue.inputValue == 'Loading offers...',
          ).single;
      for (final button in findDescendants(
        page.node,
        (node) => node.type == FFWidgetType.Button,
      )) {
        button.props.button.disabled = FFDisable(
          disabledValue: loading.props.visibility.visibleValue.deepCopy(),
        );
      }
      for (final map in findDescendants(
        page.node,
        (node) => node.name == 'ActivityMapCanvas',
      )) {
        map.props.webView
          ..forceVerticalScrollingValue = FFBooleanValue(inputValue: true)
          ..forceHorizontalScrollingValue = FFBooleanValue(inputValue: true);
      }
      for (final list in findDescendants(
        page.node,
        (node) => node.name == 'DiscoveryOfferList',
      )) {
        list.props.listView.primary = false;
        list.props.listView.scrollPhysics =
            FFScrollPhysics.FF_SCROLL_PHYSICS_NEVER;
      }
    }
  });
}

Future<void> main(List<String> args) async {
  if (!args.contains('--apply-reviewed-patch') && !args.contains('--dry-run')) {
    throw ArgumentError('Use --dry-run or --apply-reviewed-patch.');
  }
  await flutterFlowAI(
    (app) => buildDiscoveryMapPatch(
      app,
      includeExamplePages:
          !ff.Pages.all.any((page) => page.name == examplePageName),
    ),
    projectId: 'go-fun-motion-deals-vl4mj8',
    dryRun: args.contains('--dry-run'),
    commitMessage:
        'Expose activity map and native non-bookable example activity catalog',
  );
}
