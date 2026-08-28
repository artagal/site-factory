import 'package:flutterflow_ai/flutterflow_ai.dart';
import 'package:flutterflow_ai/src/helpers/tree_helpers.dart'
    show findDescendants, removeByKey;
import 'package:flutterflow_ai/src/helpers/variable_helpers.dart'
    show varFromPageParam;
import '../lib/flutterflow_project.dart' as ff;
import 'ai_experience.dart';

const legacyBrowseKeys = {
  'DiscoverPage': [
    'Row_2kjvynzx',
    'Container_xflzbl5n',
    'Container_a4mpxvi7',
    'Container_b05vnfek',
    'Container_xjh5inj8',
    'ListView_avlnvhuf',
  ],
  'DealsPage': [
    'Container_4kdu37ef',
    'TextField_e98ej6r3',
    'DropDown_yuoc3924',
    'Row_aa2rkxf9',
    'ListView_zze2o7q7',
    'Container_wfdjnwpe',
  ],
};

void ensureNativeMarketplace(App app, NativeAiApi ai) {
  final response = app.struct('MobileDealFeedResponse', {
    'cards': listOf(ai.card),
    'empty': bool_,
  });
  final categoriesResponse = app.struct('MobileBrowseCategoriesResponse', {
    'categories': listOf(ai.city),
  });
  final feed = Endpoint.get(
    'GetOpenDealFeed',
    '/api/mobile/deals?cityId=[cityId]&when=[when]&categoryId=[categoryId]&budget=[budget]',
    variables: {
      'cityId': string,
      'when': string,
      'categoryId': string,
      'budget': string,
    },
    response: response,
    settings: const EndpointSettings(decodeUtf8: true),
  );
  final categories = Endpoint.get(
    'GetBrowseCategories',
    '/api/categories',
    response: categoriesResponse,
  );
  app.apiGroup(
    'GoFunMotionBrowse',
    baseUrl: 'https://gofunmotion.com',
    endpoints: [feed, categories],
  );

  for (final handle in [ff.Pages.discoverPage, ff.Pages.dealsPage]) {
    app.editPageState(handle, (state) {
      state.ensureField('marketCards', listOf(ai.card));
      state.ensureField('marketCities', listOf(ai.city));
      state.ensureField('marketCategories', listOf(ai.city));
      state.ensureField('marketView', string.withDefault('loading'));
      state.ensureField('marketOptionsView', string.withDefault('loading'));
      state.ensureField('marketMenu', string.withDefault(''));
      state.ensureField('marketCityId', string.withDefault(''));
      state.ensureField('marketCityLabel', string.withDefault('All cities'));
      state.ensureField('marketCategoryId', string.withDefault(''));
      state.ensureField(
        'marketCategoryLabel',
        string.withDefault('All categories'),
      );
      state.ensureField('marketWhen', string.withDefault('Tonight'));
      state.ensureField('marketBudget', string.withDefault('Any budget'));
      state.ensureField('marketEmpty', bool_.withDefault(false));
      state.ensureField('marketAdvanced', bool_.withDefault(false));
    });
    app.editPageOnLoad(handle, [_loadFeed(feed), _loadOptions(ai, categories)]);
    app.editPage(handle, (page) {
      final home = handle.name == 'DiscoverPage';
      final existing = handle.widgets.all.where(
        (widget) => widget.name == 'MarketplaceBrowsePanel',
      );
      final panel = marketplaceBrowsePanel(ai, feed, categories);
      if (existing.isNotEmpty) {
        page.ensureReplaced(existing.single, panel);
      } else {
        page.ensureInsertedInto(
          handle.widgets
              .byKey(home ? 'Column_n23oclcb' : 'Column_037lyzt5')
              .single,
          panel,
        );
      }
    });
  }
  app.bottomNav(
    items: [
      BottomNavItem(ff.Pages.discoverPage, icon: 'home_outlined'),
      BottomNavItem(ff.Pages.findPlanPage, icon: 'auto_awesome_outlined'),
      BottomNavItem(ff.Pages.dealsPage, icon: 'local_offer_outlined'),
      BottomNavItem(ff.Pages.savedPage, icon: 'bookmark_border'),
      BottomNavItem(ff.Pages.profilePage, icon: 'person_outline'),
    ],
    style: BottomNavStyle.flutter,
    backgroundColor: Colors.secondaryBackground,
    selectedColor: Colors.tertiary,
    unselectedColor: Colors.secondaryText,
  );
  ensureNativeAccountPolish(app);
  app.raw(polishNativeMarketplace);
}

void ensureNativeAccountPolish(App app) {
  for (final handle in [
    ff.Pages.profilePage,
    ff.Pages.partnerDashboardPage,
    ff.Pages.adminPage,
  ]) {
    app.editPage(handle, (page) {
      final target = handle.widgets.all.singleWhere(
        (widget) =>
            widget.name == 'EmptyState' || widget.name == 'NativeSignInGate',
      );
      page.ensureReplaced(
        target,
        Column(
          name: 'NativeSignInGate',
          crossAxis: CrossAxis.start,
          spacing: 12,
          children: [
            Icon('lock_outline', size: 28, color: Colors.secondaryText),
            Text('Sign in to your account', style: Styles.titleLarge),
            Text(
              handle.name == 'ProfilePage'
                  ? 'Your saved deals and booking requests, in one place.'
                  : 'Use the account linked to your partner or admin access.',
              style: Styles.bodyMedium,
              color: Colors.secondaryText,
            ),
            Button(
              'Sign In',
              name: 'GateSignInButton',
              icon: 'login',
              height: 48,
              width: double.infinity,
              borderRadius: 8,
              onTap: Navigate(ff.Pages.signInPage),
            ),
            Button(
              'Browse deals',
              icon: 'local_offer_outlined',
              height: 44,
              variant: ButtonVariant.text,
              textColor: Colors.primaryText,
              onTap: Navigate(ff.Pages.dealsPage),
            ),
          ],
        ),
      );
    });
  }
  app.editPage(ff.Pages.profilePage, (page) {
    final avatar = ff.Pages.profilePage.widgets.all.where(
      (widget) =>
          widget.name == 'Avatar Text' || widget.name == 'AccountAvatarSymbol',
    );
    if (avatar.isNotEmpty)
      page.ensureReplaced(
        avatar.single,
        Icon(
          'person_outline',
          name: 'AccountAvatarSymbol',
          size: 26,
          color: Colors.primaryText,
        ),
      );
  });
  app.editPageOnLoad(ff.Pages.dealDetailPage, [
    If(
      Not(Equals(PageParam('listingRef'), null)),
      then: [
        FirestoreRead(
          ff.Collections.listings,
          PageParam('listingRef'),
          outputAs: 'detailDeal',
        ),
        SetState('listing', const ActionOutput('detailDeal')),
      ],
      orElse: [Navigate(ff.Pages.dealsPage, replaceRoute: true)],
    ),
  ]);
  app.raw(guardDetailReference);
}

void guardDetailReference(FFProject project) {
  final page = findPage(project, name: 'DealDetailPage')!;
  final trigger = page.node.triggerActions.singleWhere(
    (trigger) =>
        trigger.trigger.triggerType == FFActionTriggerType.ON_INIT_STATE,
  );
  final param = page.params.values.singleWhere(
    (param) => param.identifier.name == 'listingRef',
  );
  final reference = varFromPageParam(param.identifier)
    ..nodeKeyRef = FFNodeKeyReference(key: page.node.key);
  // The DSL equality-to-null emits an invalid condition for document references.
  final branches = trigger.rootAction.conditionActions.trueActions;
  if (branches.length != 1) {
    throw StateError('Expected a single detail-reference guard branch.');
  }
  branches.single.condition = FFActionCondition(
    variable: FFVariable(
      source: FFVariableSource.FUNCTION_CALL,
      functionCall: FFFunctionCall(
        condition: FFCondition(
          relation: FFCondition_Relation.EXISTS_AND_NON_EMPTY,
        ),
        values: [FFValue(variable: reference)],
      ),
    ),
  );
}

DslAction _loadFeed(Endpoint endpoint, {String output = 'openDealsInitial'}) =>
    ApiCall(
      endpoint,
      outputAs: output,
      params: {
        'cityId': State('marketCityId'),
        'when': State('marketWhen'),
        'categoryId': State('marketCategoryId'),
        'budget': State('marketBudget'),
      },
      onSuccess:
          (result) => [
            SetState('marketCards', result['cards']),
            SetState('marketEmpty', result['empty']),
            SetState('marketView', 'ready'),
          ],
      onFailure: [SetState('marketView', 'error')],
    );

List<DslAction> _reload(Endpoint feed, String output) => [
  SetState('marketEmpty', false),
  SetState('marketView', 'loading'),
  _loadFeed(feed, output: output),
];

DslAction _loadOptions(
  NativeAiApi ai,
  Endpoint categories, {
  String suffix = 'Initial',
}) => ApiCall(
  ai.cities,
  outputAs: 'browseCities$suffix',
  onSuccess:
      (result) => [
        SetState('marketCities', result['cities']),
        ApiCall(
          categories,
          outputAs: 'browseCategories$suffix',
          onSuccess:
              (result) => [
                SetState('marketCategories', result['categories']),
                SetState('marketOptionsView', 'ready'),
              ],
          onFailure: [SetState('marketOptionsView', 'error')],
        ),
      ],
  onFailure: [SetState('marketOptionsView', 'error')],
);

DslWidget marketplaceBrowsePanel(
  NativeAiApi ai,
  Endpoint feed,
  Endpoint categories,
) => Column(
  name: 'MarketplaceBrowsePanel',
  crossAxis: CrossAxis.start,
  spacing: 12,
  children: [
    Text('Find an open spot', style: Styles.titleLarge),
    Row(
      spacing: 8,
      children: [
        Expanded(
          Button(
            State('marketCityLabel'),
            name: 'BrowseCityPicker',
            icon: 'place_outlined',
            height: 48,
            borderRadius: 8,
            color: Colors.secondaryBackground,
            textColor: Colors.primaryText,
            onTap: If(
              Equals(State('marketMenu'), 'city'),
              then: [SetState('marketMenu', '')],
              orElse: [SetState('marketMenu', 'city')],
            ),
          ),
        ),
        Expanded(
          Dropdown(
            name: 'BrowseWhenFilter',
            label: 'When',
            options: const [
              'Any time',
              'Tonight',
              'Today',
              'Tomorrow',
              'Weekend',
            ],
            value: 'Tonight',
            onChanged: [
              SetState('marketWhen', const WidgetValue()),
              ..._reload(feed, 'dealsByTime'),
            ],
          ),
        ),
        IconButton(
          'tune',
          name: 'BrowseMoreFilters',
          size: 48,
          fillColor: Colors.secondaryBackground,
          color: Colors.primaryText,
          borderRadius: 8,
          onTap: [
            SetState('marketMenu', ''),
            If(
              State('marketAdvanced'),
              then: [SetState('marketAdvanced', false)],
              orElse: [SetState('marketAdvanced', true)],
            ),
          ],
        ),
      ],
    ),
    _optionList('city', 'All cities', 'marketCities', feed),
    Button(
      State('marketCategoryLabel'),
      name: 'BrowseCategoryPicker',
      visible: State('marketAdvanced'),
      icon: 'category_outlined',
      height: 48,
      width: double.infinity,
      borderRadius: 8,
      color: Colors.secondaryBackground,
      textColor: Colors.primaryText,
      onTap: If(
        Equals(State('marketMenu'), 'category'),
        then: [SetState('marketMenu', '')],
        orElse: [SetState('marketMenu', 'category')],
      ),
    ),
    _optionList('category', 'All categories', 'marketCategories', feed),
    Dropdown(
      name: 'BrowseBudgetFilter',
      visible: State('marketAdvanced'),
      label: 'Budget per person',
      options: const [
        'Any budget',
        'Free',
        r'$25 or less',
        r'$50 or less',
        r'$100 or less',
      ],
      value: 'Any budget',
      onChanged: [
        SetState('marketBudget', const WidgetValue()),
        ..._reload(feed, 'dealsByBudget'),
      ],
    ),
    Button(
      'Retry city and category list',
      icon: 'refresh',
      height: 44,
      visible: Equals(State('marketOptionsView'), 'error'),
      onTap: _loadOptions(ai, categories, suffix: 'Retry'),
    ),
    ProgressBar.circular(
      size: 28,
      visible: Equals(State('marketView'), 'loading'),
    ),
    Column(
      name: 'BrowseLoadError',
      crossAxis: CrossAxis.start,
      spacing: 8,
      visible: Equals(State('marketView'), 'error'),
      children: [
        Text(
          'Deals could not load. Check your connection and try again.',
          style: Styles.bodyMedium,
        ),
        Button(
          'Retry deals',
          icon: 'refresh',
          height: 48,
          onTap: _reload(feed, 'dealsRetry'),
        ),
        Button(
          'Browse on website',
          icon: 'open_in_new',
          height: 44,
          variant: ButtonVariant.text,
          textColor: Colors.primaryText,
          onTap: LaunchUrl('https://gofunmotion.com/deals'),
        ),
      ],
    ),
    Column(
      name: 'BrowseEmptyState',
      crossAxis: CrossAxis.start,
      spacing: 8,
      visible: State('marketEmpty'),
      children: [
        Text('No open deals match yet', style: Styles.titleMedium),
        Text(
          'Try another time or category, or join the city waitlist.',
          style: Styles.bodyMedium,
          color: Colors.secondaryText,
        ),
        Button(
          'Join city waitlist',
          icon: 'notifications_none',
          height: 48,
          color: Colors.tertiary,
          textColor: Colors.primaryBackground,
          onTap: Navigate(ff.Pages.waitlistPage),
        ),
      ],
    ),
    ListView(
      name: 'MarketplaceDealList',
      source: State('marketCards'),
      shrinkWrap: true,
      spacing: 12,
      visible: Equals(State('marketView'), 'ready'),
      itemBuilder:
          (item) => Container(
            name: 'MarketplaceDealCard',
            width: double.infinity,
            borderRadius: 8,
            borderWidth: 1,
            borderColor: Colors.alternate,
            color: Colors.secondaryBackground,
            child: Column(
              crossAxis: CrossAxis.start,
              children: [
                Image(
                  item['imageUrl'],
                  width: double.infinity,
                  height: 160,
                  borderRadius: 8,
                  visible: Not(Equals(item['imageUrl'], '')),
                ),
                Container(
                  padding: 16,
                  child: Column(
                    crossAxis: CrossAxis.start,
                    spacing: 8,
                    children: [
                      Text(item['title'], style: Styles.titleMedium),
                      Text(
                        item['priceLabel'],
                        style: Styles.headlineSmall,
                        color: Colors.tertiary,
                      ),
                      Text(
                        item['wasLabel'],
                        style: Styles.bodySmall,
                        color: Colors.secondaryText,
                        visible: Not(Equals(item['wasLabel'], '')),
                      ),
                      Text(item['timeLabel'], style: Styles.labelMedium),
                      Text(
                        item['spotsLabel'],
                        style: Styles.labelMedium,
                        color: Colors.secondary,
                      ),
                      Text(
                        item['description'],
                        style: Styles.bodyMedium,
                        color: Colors.secondaryText,
                      ),
                      Button(
                        'View Deal',
                        name: 'BrowseOpenDeal',
                        icon: 'arrow_forward',
                        height: 48,
                        width: double.infinity,
                        borderRadius: 8,
                        color: Colors.tertiary,
                        textColor: Colors.primaryBackground,
                        onTap: Navigate(
                          ff.Pages.dealDetailPage,
                          params: {
                            'listingRef': CustomFunction(
                              ai.listingReference,
                              args: {'listingId': item['listingId']},
                            ),
                          },
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
    ),
    Button(
      'Refresh deals',
      name: 'BrowseRefreshDeals',
      icon: 'refresh',
      height: 44,
      variant: ButtonVariant.text,
      textColor: Colors.primaryText,
      visible: Equals(State('marketView'), 'ready'),
      onTap: _reload(feed, 'dealsRefresh'),
    ),
  ],
);

DslWidget _optionList(
  String kind,
  String allLabel,
  String listState,
  Endpoint feed,
) {
  final idState = kind == 'city' ? 'marketCityId' : 'marketCategoryId';
  final labelState = kind == 'city' ? 'marketCityLabel' : 'marketCategoryLabel';
  List<DslAction> select(Object id, Object label, String suffix) => [
    SetState(idState, id),
    SetState(labelState, label),
    SetState('marketMenu', ''),
    ..._reload(feed, 'dealsBy$kind$suffix'),
  ];
  return Column(
    name: 'Browse${kind}Options',
    visible: Equals(State('marketMenu'), kind),
    spacing: 4,
    children: [
      Button(
        allLabel,
        icon: 'public',
        width: double.infinity,
        height: 48,
        variant: ButtonVariant.outlined,
        textColor: Colors.primaryText,
        onTap: select('', allLabel, 'All'),
      ),
      ListView(
        name: 'Browse${kind}OptionList',
        source: State(listState),
        shrinkWrap: true,
        spacing: 4,
        itemBuilder:
            (item) => Button(
              item['label'],
              width: double.infinity,
              height: 48,
              color: Colors.secondaryBackground,
              textColor: Colors.primaryText,
              onTap: select(item['id'], item['label'], 'Selected'),
            ),
      ),
    ],
  );
}

void polishNativeMarketplace(FFProject project) {
  removeLegacyBrowseWidgets(project);
  project.navBar.showSelectedLabels = true;
  project.navBar.showUnselectedLabels = true;
  for (final entry
      in {
        'DiscoverPage': 'Home',
        'FindPlanPage': 'Plan',
        'DealsPage': 'Deals',
        'SavedPage': 'Saved',
        'ProfilePage': 'Account',
      }.entries) {
    final page = findPage(project, name: entry.key)!;
    page.node.props.scaffold.navBarItem.label = FFText(
      textValue: FFStringValue(inputValue: entry.value),
    );
  }
  for (final name in ['DiscoverPage', 'DealsPage']) {
    final page = findPage(project, name: name)!;
    for (final node in findDescendants(
      page.node,
      (node) =>
          node.name == 'MarketplaceDealList' ||
          node.name.startsWith('BrowsecityOptionList') ||
          node.name.startsWith('BrowsecategoryOptionList'),
    )) {
      node.props.listView.primary = false;
      node.props.listView.scrollPhysics =
          FFScrollPhysics.FF_SCROLL_PHYSICS_NEVER;
    }
    if (findDescendants(
          page.node,
          (node) => node.name == 'MarketplaceBrowsePanel',
        ).length !=
        1) {
      throw StateError('Expected exactly one native browse panel on $name.');
    }
  }
}

void removeLegacyBrowseWidgets(FFProject project) {
  // Exact keys avoid path-index drift when several siblings are removed.
  // Only the audited prototype widgets are removed; Builder edits are preserved.
  for (final entry in legacyBrowseKeys.entries) {
    final page = findPage(project, name: entry.key);
    if (page == null) continue;
    for (final key in entry.value) {
      removeByKey(page.node, key);
    }
    if (findDescendants(
      page.node,
      (node) => entry.value.contains(node.key),
    ).isNotEmpty) {
      throw StateError('Legacy browse widgets remain on ${entry.key}.');
    }
  }
}
