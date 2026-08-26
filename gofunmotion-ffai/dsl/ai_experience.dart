import 'package:flutterflow_ai/flutterflow_ai.dart';
import 'package:flutterflow_ai/src/helpers/project_helpers.dart'
    show findStateField;
import 'package:flutterflow_ai/src/helpers/tree_helpers.dart'
    show findDescendants;
import 'package:flutterflow_ai/src/helpers/variable_helpers.dart'
    show varFromPageState;
import 'package:flutterflow_ai/src/ui/actions.dart' show Actions;
import '../lib/flutterflow_project.dart' as ff;

const aiAssistantPageName = 'AiAssistantPage';
const aiSupportPageName = 'AiSupportPage';

DslWidget aiConsentPanel({String name = 'AiConsentPanel'}) => Column(
  name: name,
  crossAxis: CrossAxis.start,
  spacing: 6,
  children: [
    Toggle(
      name: '${name}Toggle',
      label: 'Allow AI help from OpenAI',
      value: State('aiConsent'),
      onChanged: SetState('aiConsent', const WidgetValue()),
    ),
    Text(
      'When enabled, your request and relevant deal details are sent to OpenAI. Do not include private or payment information. Turn off at any time.',
      style: Styles.bodySmall,
      color: Colors.secondaryText,
    ),
    Button(
      'Privacy',
      icon: 'privacy_tip_outlined',
      height: 44,
      variant: ButtonVariant.text,
      textColor: Colors.primaryText,
      onTap: LaunchUrl('https://gofunmotion.com/privacy'),
    ),
  ],
);

final class NativeAiApi {
  const NativeAiApi(
    this.assistant,
    this.cities,
    this.savePlan,
    this.card,
    this.city,
    this.listingReference,
  );
  final Endpoint assistant;
  final Endpoint cities;
  final Endpoint savePlan;
  final StructHandle card;
  final StructHandle city;
  final CustomFunctionHandle listingReference;
}

NativeAiApi declareNativeAiApi(App app, FirestoreCollectionHandle listings) {
  final card = app.struct('MobileAssistantCard', {
    'description': string,
    'imageUrl': string,
    'listingId': string,
    'priceLabel': string,
    'spotsLabel': string,
    'timeLabel': string,
    'title': string,
    'wasLabel': string,
  });
  final city = app.struct('MobileAssistantCity', {
    'id': string,
    'label': string,
  });
  final response = app.struct('MobileAssistantResponse', {
    'answer': string,
    'cards': listOf(card),
    'empty': bool_,
    'needsHumanSupport': bool_,
    'planJson': string,
    'provider': string,
    'title': string,
  });
  final cityResponse = app.struct('MobileAssistantCitiesResponse', {
    'cities': listOf(city),
  });
  final saveResponse = app.struct('MobileAssistantSaveResponse', {
    'saved': bool_,
    'planId': string,
  });
  final assistant = Endpoint.post(
    'AskGoFunMotion',
    '/api/mobile/assistant',
    variables: {
      'aiConsent': bool_,
      'cityId': string,
      'mode': string,
      'query': string,
      'budget': string,
      'when': string,
      'who': string,
      'vibe': string,
    },
    body: const {
      'aiConsent': '<aiConsent>',
      'cityId': '<cityId>',
      'mode': '<mode>',
      'query': '<query>',
      'budget': '<budget>',
      'when': '<when>',
      'who': '<who>',
      'vibe': '<vibe>',
    },
    settings: const EndpointSettings(
      escapeVariablesInRequestBody: true,
      encodeBodyUtf8: true,
      decodeUtf8: true,
    ),
    response: response,
  );
  final cities = Endpoint.get(
    'GetAssistantCities',
    '/api/cities',
    response: cityResponse,
  );
  final save = Endpoint.post(
    'SaveAssistantPlan',
    '/api/me/saved-plans',
    variables: {'planJson': string, 'token': string},
    body: const {'planJson': '<planJson>'},
    headers: const {'Authorization': 'Bearer [token]'},
    settings: const EndpointSettings(
      requireAuthentication: true,
      escapeVariablesInRequestBody: true,
      encodeBodyUtf8: true,
      decodeUtf8: true,
    ),
    response: saveResponse,
  );
  app.apiGroup(
    'GoFunMotionAssistant',
    baseUrl: 'https://gofunmotion.com',
    headers: const {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    },
    endpoints: [assistant, cities, save],
  );
  final listingReference = app.customFunction(
    'goFunMotionListingReference',
    args: {'listingId': string},
    returns: docRef(listings),
    description:
        'Converts a server-returned listing ID to a native Firestore reference. No data reads, writes, or UI. Firestore rules still enforce public approval.',
    code: r'''
final id = listingId?.trim() ?? '';
if (id.isEmpty || id.contains('/') || id == '.' || id == '..') return null;
return FirebaseFirestore.instance.collection('listings').doc(id);
''',
  );
  return NativeAiApi(assistant, cities, save, card, city, listingReference);
}

Map<String, DslType> _resultState(NativeAiApi api) => {
  'aiConsent': bool_.withDefault(false),
  'viewState': string.withDefault('idle'),
  'answer': string.withDefault(''),
  'resultTitle': string.withDefault(''),
  'provider': string.withDefault(''),
  'planJson': string.withDefault(''),
  'cards': listOf(api.card),
  'empty': bool_.withDefault(false),
  'needsHumanSupport': bool_.withDefault(false),
};

DslAction assistantRequest(
  NativeAiApi api, {
  Object mode = 'deals',
  Object? city,
  Object? query,
  Map<String, Object?> preferences = const {},
}) => If(
  Not(Equals(State('viewState'), 'loading')),
  then: [
    SetState('viewState', 'loading'),
    SetState('planJson', ''),
    ApiCall(
      api.assistant,
      outputAs: 'assistantAnswer',
      params: {
        'aiConsent': State('aiConsent'),
        'cityId': city ?? State('cityId'),
        'mode': mode,
        'query':
            query ?? WidgetState('AssistantQuery', WidgetStateProperty.text),
        'budget': '',
        'when': '',
        'who': '',
        'vibe': '',
        ...preferences,
      },
      onSuccess:
          (result) => [
            SetState('cards', result['cards']),
            SetState('answer', result['answer']),
            SetState('resultTitle', result['title']),
            SetState('provider', result['provider']),
            SetState('planJson', result['planJson']),
            SetState('empty', result['empty']),
            SetState('needsHumanSupport', result['needsHumanSupport']),
            SetState('viewState', 'ready'),
          ],
      onFailure: [SetState('viewState', 'error')],
    ),
  ],
);

DslWidget assistantResults(NativeAiApi api) => Column(
  name: 'AssistantResults',
  crossAxis: CrossAxis.start,
  spacing: 14,
  children: [
    ProgressBar.circular(
      size: 28,
      visible: Equals(State('viewState'), 'loading'),
    ),
    Text(
      'Choose a city, add a short request, and try again. Browsing deals is still available.',
      style: Styles.bodyMedium,
      color: Colors.error,
      visible: Equals(State('viewState'), 'error'),
    ),
    Column(
      name: 'AssistantReadyResults',
      visible: Equals(State('viewState'), 'ready'),
      crossAxis: CrossAxis.start,
      spacing: 12,
      children: [
        Text(
          'AI-assisted',
          style: Styles.labelMedium,
          color: Colors.secondary,
          visible: Equals(State('provider'), 'openai'),
        ),
        Text(
          'Standard matching / verified help',
          style: Styles.labelMedium,
          color: Colors.secondaryText,
          visible: Not(Equals(State('provider'), 'openai')),
        ),
        Text(State('resultTitle'), style: Styles.titleLarge),
        Text(State('answer'), style: Styles.bodyMedium),
        ListView(
          name: 'AssistantResultCards',
          source: State('cards'),
          shrinkWrap: true,
          spacing: 14,
          itemBuilder:
              (item) => Container(
                name: 'AssistantDealCard',
                width: double.infinity,
                borderRadius: 8,
                color: Colors.secondaryBackground,
                borderColor: Colors.alternate,
                borderWidth: 1,
                child: Column(
                  crossAxis: CrossAxis.start,
                  children: [
                    Image(
                      item['imageUrl'],
                      width: double.infinity,
                      height: 156,
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
                          Text(item['description'], style: Styles.bodyMedium),
                          Button(
                            'View Deal',
                            name: 'AssistantOpenDeal',
                            icon: 'arrow_forward',
                            width: double.infinity,
                            height: 48,
                            borderRadius: 8,
                            visible: Not(Equals(item['listingId'], '')),
                            onTap: Navigate(
                              ff.Pages.dealDetailPage,
                              params: {
                                'listingRef': CustomFunction(
                                  api.listingReference,
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
          'Save Plan',
          name: 'AssistantSavePlan',
          icon: 'bookmark_border',
          height: 48,
          width: double.infinity,
          borderRadius: 8,
          visible: Not(Equals(State('planJson'), '')),
          onTap: If(
            const Global(GlobalProperty.isUserLoggedIn),
            then: [
              ApiCall(
                api.savePlan,
                outputAs: 'savedAssistantPlan',
                params: {
                  'planJson': State('planJson'),
                  'token': const AuthUser(AuthUserField.jwtToken),
                },
                onSuccess: (_) => [Snackbar('Plan saved.')],
                onFailure: [Snackbar('Could not save. Please retry.')],
              ),
            ],
            orElse: [Navigate(ff.Pages.signInPage)],
          ),
        ),
        Button(
          'Share',
          icon: 'ios_share',
          height: 44,
          variant: ButtonVariant.text,
          textColor: Colors.primaryText,
          onTap: Share(State('answer')),
        ),
        Button(
          'Join city waitlist',
          icon: 'notifications_none',
          height: 48,
          visible: State('empty'),
          onTap: Navigate(ff.Pages.waitlistPage),
        ),
        Button(
          'Contact support',
          icon: 'mail_outline',
          height: 48,
          visible: State('needsHumanSupport'),
          onTap: LaunchUrl('mailto:hello@gofunmotion.com'),
        ),
      ],
    ),
  ],
);

Object ensureNativeAssistantPage(
  App app,
  NativeAiApi api, {
  Object? existingPage,
}) {
  if (existingPage != null) return existingPage;
  return app.ensurePage(
    aiAssistantPageName,
    route: '/ai-assistant',
    description:
        'Builder-editable AI search and grounded plan cards. No signup to browse. AI requires opt-in.',
    params: {'query': string.withDefault('')},
    state: {
      ..._resultState(api),
      'cityId': string.withDefault(''),
      'cityLabel': string.withDefault('Choose city'),
      'choosingCity': bool_.withDefault(false),
      'cities': listOf(api.city),
      'citiesState': string.withDefault('loading'),
      'mode': string.withDefault('deals'),
    },
    onLoad: [
      SetFormField('AssistantQuery', const PageParam('query')),
      _loadCities(api),
    ],
    body: Scaffold(
      appBar: AppBar(title: 'AI Fun Finder'),
      body: Container(
        padding: 20,
        child: Column(
          name: 'AssistantContent',
          scrollable: true,
          crossAxis: CrossAxis.start,
          spacing: 16,
          children: [
            Text('What sounds fun?', style: Styles.headlineSmall),
            Button(
              State('cityLabel'),
              name: 'AssistantCityButton',
              icon: 'location_on_outlined',
              height: 48,
              width: double.infinity,
              color: Colors.secondaryBackground,
              textColor: Colors.primaryText,
              onTap: SetState('choosingCity', Not(State('choosingCity'))),
            ),
            Text(
              'Loading cities...',
              visible: Equals(State('citiesState'), 'loading'),
            ),
            Button(
              'Retry cities',
              icon: 'refresh',
              height: 44,
              visible: Equals(State('citiesState'), 'error'),
              onTap: _loadCities(api, output: 'assistantCitiesRetry'),
            ),
            ListView(
              name: 'AssistantCitiesList',
              source: State('cities'),
              shrinkWrap: true,
              spacing: 6,
              visible: State('choosingCity'),
              itemBuilder:
                  (city) => Button(
                    city['label'],
                    icon: 'place_outlined',
                    height: 48,
                    color: Colors.secondaryBackground,
                    textColor: Colors.primaryText,
                    onTap: [
                      SetState('cityId', city['id']),
                      SetState('cityLabel', city['label']),
                      SetState('choosingCity', false),
                      SetState('viewState', 'idle'),
                    ],
                  ),
            ),
            Dropdown(
              name: 'AssistantMode',
              label: 'Looking for',
              options: const ['deals', 'plan'],
              value: 'deals',
              onChanged: [
                SetState('mode', const WidgetValue()),
                SetState('viewState', 'idle'),
              ],
            ),
            TextField(
              name: 'AssistantQuery',
              label: 'Your idea',
              hint: r'Date night tonight under $50',
              maxLines: 2,
            ),
            Wrap(
              spacing: 6,
              runSpacing: 6,
              children: [
                _prompt('Date night', r'Date night tonight under $50'),
                _prompt('Family', r'Indoor family fun this weekend under $25'),
                _prompt(
                  'With friends',
                  'Something creative with friends tomorrow',
                ),
              ],
            ),
            aiConsentPanel(),
            Button(
              'Find matches',
              name: 'AssistantFindMatches',
              icon: 'auto_awesome',
              height: 50,
              width: double.infinity,
              borderRadius: 8,
              onTap: assistantRequest(api, mode: State('mode')),
            ),
            assistantResults(api),
            Button(
              'Browse all deals',
              icon: 'local_offer_outlined',
              variant: ButtonVariant.text,
              textColor: Colors.primaryText,
              height: 44,
              onTap: Navigate(ff.Pages.dealsPage),
            ),
          ],
        ),
      ),
    ),
  );
}

DslAction _loadCities(
  NativeAiApi api, {
  String output = 'assistantCitiesInitial',
}) => ApiCall(
  api.cities,
  outputAs: output,
  onSuccess:
      (result) => [
        SetState('cities', result['cities']),
        SetState('citiesState', 'ready'),
      ],
  onFailure: [SetState('citiesState', 'error')],
);

DslWidget _prompt(String label, String query) => Button(
  label,
  icon: 'auto_awesome',
  height: 44,
  variant: ButtonVariant.outlined,
  textColor: Colors.primaryText,
  borderRadius: 8,
  onTap: SetFormField('AssistantQuery', query),
);

Object ensureNativeSupportPage(
  App app,
  NativeAiApi api, {
  Object? existingPage,
}) {
  if (existingPage != null) return existingPage;
  return app.ensurePage(
    aiSupportPageName,
    route: '/ai-support',
    description:
        'Native help assistant with FAQ fallback, per-screen AI consent and human escalation.',
    state: _resultState(api),
    body: Scaffold(
      appBar: AppBar(title: 'Help & support'),
      body: Container(
        padding: 20,
        child: Column(
          scrollable: true,
          crossAxis: CrossAxis.start,
          spacing: 16,
          children: [
            Text('How can we help?', style: Styles.headlineSmall),
            TextField(
              name: 'AssistantQuery',
              label: 'Your question',
              hint: 'What does pending mean?',
              maxLines: 3,
            ),
            Wrap(
              spacing: 6,
              runSpacing: 6,
              children: [
                _prompt(
                  'Booking status',
                  'Where can I see my booking request status?',
                ),
                _prompt('Payments', 'Do I pay when I send a booking request?'),
                _prompt(
                  'My business',
                  'How does my business get a deal published?',
                ),
              ],
            ),
            aiConsentPanel(),
            Button(
              'Get help',
              name: 'SupportAskButton',
              icon: 'chat_bubble_outline',
              height: 50,
              width: double.infinity,
              borderRadius: 8,
              onTap: assistantRequest(api, mode: 'support', city: ''),
            ),
            assistantResults(api),
            Button(
              'Email support',
              icon: 'mail_outline',
              height: 48,
              variant: ButtonVariant.outlined,
              textColor: Colors.primaryText,
              onTap: LaunchUrl('mailto:hello@gofunmotion.com'),
            ),
          ],
        ),
      ),
    ),
  );
}

NativeAiApi ensureNativeAiExperience(App app) {
  final api = declareNativeAiApi(app, ff.Collections.listings);
  final assistant = ensureNativeAssistantPage(
    app,
    api,
    existingPage: ff.Pages.aiAssistantPage,
  );
  final support = ensureNativeSupportPage(
    app,
    api,
    existingPage: ff.Pages.aiSupportPage,
  );

  app.editPage(ff.Pages.dealsPage, (page) {
    final button = Button(
      'Ask AI to find a deal',
      name: 'MobileSmartSearchPanel',
      icon: 'auto_awesome',
      width: double.infinity,
      height: 48,
      borderRadius: 8,
      onTap: Navigate(assistant, params: {'query': ''}),
    );
    final existing = ff.Pages.dealsPage.widgets.all.where(
      (widget) => widget.name == 'MobileSmartSearchPanel',
    );
    if (existing.isNotEmpty) {
      page.ensureReplaced(existing.single, button);
    } else {
      page.ensureInsertedInto(
        ff.Pages.dealsPage.widgets.byKey('Column_037lyzt5').single,
        button,
      );
    }
  });
  app.editPage(ff.Pages.discoverPage, (page) {
    page.ensureInsertedAfter(
      ff.Pages.discoverPage.widgets.all.singleWhere(
        (widget) => widget.name == 'DealFirstDiscoveryHeader',
      ),
      Button(
        'AI Fun Finder',
        name: 'DiscoverAssistantEntry',
        icon: 'auto_awesome',
        height: 44,
        variant: ButtonVariant.text,
        textColor: Colors.secondary,
        onTap: Navigate(assistant, params: {'query': ''}),
      ),
    );
  });
  app.editPage(ff.Pages.profilePage, (page) {
    if (ff.Pages.profilePage.widgets.all.any(
      (widget) => widget.name == 'ProfileSupportEntry',
    ))
      return;
    page.ensureInsertedBefore(
      page.findByText('Logout'),
      Button(
        'Help & AI support',
        name: 'ProfileSupportEntry',
        icon: 'help_outline',
        height: 48,
        width: double.infinity,
        borderRadius: 8,
        onTap: Navigate(support),
      ),
    );
  });
  app.editPage(ff.Pages.aiAssistantPage, (page) {
    if (ff.Pages.aiAssistantPage.widgets.all.any(
      (widget) => widget.name == 'AssistantSupportEntry',
    ))
      return;
    page.ensureInsertedAfter(
      page.findByText('Browse all deals'),
      Button(
        'Help & support',
        name: 'AssistantSupportEntry',
        icon: 'help_outline',
        height: 44,
        variant: ButtonVariant.text,
        textColor: Colors.primaryText,
        onTap: Navigate(support),
      ),
    );
  });
  app.editPage(ff.Pages.aiSupportPage, (page) {
    page.bindText(
      ff.Pages.aiSupportPage.widgets.byKey('Text_aj4s87hp').single,
      'Please add a question and try again. You can also email support below.',
    );
  });
  app.editPageState(ff.Pages.findPlanPage, (state) {
    for (final entry in _resultState(api).entries) {
      state.ensureField(entry.key, entry.value);
    }
  });
  app.editPage(ff.Pages.findPlanPage, (page) {
    page.ensureReplaced(
      ff.Pages.findPlanPage.widgets.all.singleWhere(
        (widget) =>
            widget.key == 'Container_02ev2lmp' ||
            widget.name == 'NativePlannerIntro',
      ),
      Column(
        name: 'NativePlannerIntro',
        crossAxis: CrossAxis.start,
        spacing: 8,
        children: [
          Text('Find a plan that fits', style: Styles.headlineSmall),
          Text(
            'Choose your city, budget and company.',
            style: Styles.bodyMedium,
            color: Colors.secondaryText,
          ),
        ],
      ),
    );
    page.bindVisible(
      ff.Pages.findPlanPage.widgets.byKey('Container_ycu7xmqy').single,
      false,
    );
    page.ensureActions(
      ff.Pages.findPlanPage.widgets.byKey('Button_id060slz').single,
      triggerType: FFActionTriggerType.ON_TAP,
      actions: [
        assistantRequest(
          api,
          mode: 'plan',
          city: State('city'),
          query: State('vibe'),
          preferences: {
            'budget': State('budget'),
            'when': State('when'),
            'who': State('persona'),
            'vibe': State('vibe'),
          },
        ),
      ],
    );
    page.ensureInsertedAfter(
      ff.Pages.findPlanPage.widgets.byKey('Button_id060slz').single,
      assistantResults(api),
    );
    page.ensureInsertedBefore(
      ff.Pages.findPlanPage.widgets.byKey('Button_id060slz').single,
      aiConsentPanel(name: 'PlannerAiConsent'),
    );
  });
  app.editPageState(
    ff.Pages.dealDetailPage,
    (state) => state.ensureField('aiConsent', bool_.withDefault(false)),
  );
  app.editPage(ff.Pages.dealDetailPage, (page) {
    page.ensureInsertedBefore(
      page.findByName('BookingMessageAssistantCard'),
      aiConsentPanel(name: 'BookingAiConsent'),
    );
  });
  app.editPageState(
    ff.Pages.partnerDealEditorPage,
    (state) => state.ensureField('aiConsent', bool_.withDefault(false)),
  );
  app.editPage(ff.Pages.partnerDealEditorPage, (page) {
    page.ensureInsertedBefore(
      ff.Pages.partnerDealEditorPage.widgets.all.singleWhere(
        (widget) => widget.name == 'DealEditorTitleFieldAiButton',
      ),
      aiConsentPanel(name: 'PartnerAiConsent'),
    );
  });
  app.raw(guardExistingAiActions);
  app.raw(verifyNativeAiStructure);
  app.raw((project) {
    for (final name in [
      aiAssistantPageName,
      aiSupportPageName,
      'FindPlanPage',
    ]) {
      final page = findPage(project, name: name)!;
      for (final node in findDescendants(
        page.node,
        (node) =>
            node.name == 'AssistantResultCards' ||
            node.name == 'AssistantCitiesList',
      )) {
        node.props.listView.primary = false;
        node.props.listView.scrollPhysics =
            FFScrollPhysics.FF_SCROLL_PHYSICS_NEVER;
      }
    }
  });
  return api;
}

void verifyNativeAiStructure(FFProject project) {
  for (final entry
      in {
        'DiscoverPage': ['DiscoverAssistantEntry'],
        'DealsPage': ['MobileSmartSearchPanel'],
        'FindPlanPage': ['AssistantResults', 'PlannerAiConsent'],
        'DealDetailPage': ['BookingAiConsent', 'BookingMessageAssistantCard'],
        'PartnerDealEditorPage': ['PartnerAiConsent'],
        'ProfilePage': ['ProfileSupportEntry'],
        aiAssistantPageName: [
          'AssistantResultCards',
          'AssistantCitiesList',
          'AssistantSupportEntry',
        ],
        aiSupportPageName: ['AssistantResults'],
      }.entries) {
    final page = findPage(project, name: entry.key)!;
    for (final name in entry.value) {
      final count =
          findDescendants(page.node, (node) => node.name == name).length;
      if (count != 1) {
        throw StateError(
          'Expected one $name on ${entry.key}, got $count; refusing duplicate or missing UI.',
        );
      }
    }
  }
}

void guardExistingAiActions(FFProject project) {
  for (final entry
      in {
        'DealDetailPage': ['DraftBookingMessageButton'],
        'PartnerDealEditorPage': [
          'DealEditorTitleFieldAiButton',
          'DealEditorDescriptionFieldAiButton',
        ],
      }.entries) {
    final page = findPage(project, name: entry.key)!;
    final field =
        findStateField(
          project,
          widgetClassName: entry.key,
          fieldName: 'aiConsent',
        )!;
    for (final name in entry.value) {
      final matches = findDescendants(page.node, (node) => node.name == name);
      if (matches.length != 1)
        throw StateError('Expected one AI consent target: $name');
      final node = matches.single;
      for (final trigger in node.triggerActions) {
        if (trigger.trigger.triggerType != FFActionTriggerType.ON_TAP) continue;
        final original = trigger.rootAction.deepCopy();
        // Idempotent, native conditional; never a custom runtime wrapper.
        if (original.key == '${node.key}_ai_consent') continue;
        final guard = Actions.conditional(
          condition: varFromPageState(field.parameter.identifier)
            ..nodeKeyRef = FFNodeKeyReference(key: page.node.key),
          trueActions: original,
          falseActions: Actions.chain([
            Actions.snackBar('Enable AI help above, or write your own text.'),
          ]),
        );
        guard.key = '${node.key}_ai_consent';
        trigger.rootAction = guard;
      }
    }
  }
}
