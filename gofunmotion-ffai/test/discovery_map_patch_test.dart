import 'package:flutterflow_ai/flutterflow_ai.dart';
import 'package:flutterflow_ai/src/helpers/tree_helpers.dart'
    show findDescendants;
import 'package:test/test.dart';
import '../dsl/discovery_map_patch.dart';
import '../lib/flutterflow_project.dart' as ff;

void main() {
  test('Map tab and example pages compile without custom screen code', () {
    final initial = fixture();
    final pageCount = initial.pageKeys.length;
    final account =
        findPage(initial, name: ff.Pages.profilePage.name)!.writeToBuffer();
    final partner =
        findPage(
          initial,
          name: ff.Pages.partnerDashboardPage.name,
        )!.writeToBuffer();
    final result =
        compileApp(buildApp(buildDiscoveryMapPatch), project: initial).project;
    expect(result.pageKeys.length, pageCount + 2);
    expect(findPage(result, name: examplePageName), isNotNull);
    expect(findPage(result, name: exampleBrowseName), isNotNull);
    expect(
      findPage(
        result,
        name: ff.Pages.partnerDashboardPage.name,
      )!.writeToBuffer(),
      partner,
    );
    expect(
      findPage(result, name: ff.Pages.profilePage.name)!.node.children,
      findPage(initial, name: ff.Pages.profilePage.name)!.node.children,
    );
    expect(account, isNotEmpty);
    final map = findPage(result, name: ff.Pages.dealsMapPage.name)!;
    expect(
      map.node.props.scaffold.navBarItem.label.textValue.inputValue,
      'Map',
    );
    expect(
      result.navBar.pageKeyRefOrder.map(
        (ref) => result.widgetClasses[ref.key]!.name,
      ),
      ['DiscoverPage', 'DealsMapPage', 'DealsPage', 'SavedPage', 'ProfilePage'],
    );
    expect(
      result.pageKeys.where(
        (key) => result.widgetClasses[key]!.node.props.scaffold.navBarItem.show,
      ),
      hasLength(5),
    );
    expect(
      findPage(
        result,
        name: 'FindPlanPage',
      )!.node.props.scaffold.navBarItem.show,
      isFalse,
    );
    final canvas =
        findDescendants(
          map.node,
          (node) => node.name == 'ActivityMapCanvas',
        ).single;
    expect(canvas.type, FFWidgetType.WebView);
    expect(canvas.props.hasVisibility(), isFalse);
    expect(canvas.props.webView.forceVerticalScrollingValue.inputValue, isTrue);
    expect(
      canvas.props.webView.forceHorizontalScrollingValue.inputValue,
      isTrue,
    );
    for (final name in [ff.Pages.discoverPage.name, ff.Pages.dealsPage.name]) {
      final page = findPage(result, name: name)!;
      expect(
        findDescendants(page.node, (node) => node.name == 'DiscoveryMapEntry'),
        hasLength(1),
      );
      expect(
        findDescendants(
          page.node,
          (node) => node.name == 'ManualBuilderContent',
        ),
        hasLength(1),
      );
    }
    for (final name in [
      ff.Pages.dealsMapPage.name,
      examplePageName,
      exampleBrowseName,
    ]) {
      final page = findPage(result, name: name)!;
      final buttons = findDescendants(
        page.node,
        (node) => node.type == FFWidgetType.Button,
      );
      expect(
        buttons.every(
          (button) => button.props.button.disabled.hasDisabledValue(),
        ),
        isTrue,
      );
      final bar =
          findDescendants(
            page.node,
            (node) => node.type == FFWidgetType.AppBar,
          ).single;
      expect(
        bar.props.appBar.backButtonColorValue.inputValue.themeColor,
        FFColor_ThemeColor.PRIMARY_TEXT,
      );
      final list =
          findDescendants(
            page.node,
            (node) => node.name == 'DiscoveryOfferList',
          ).single;
      expect(list.props.listView.primary, isFalse);
      expect(
        list.props.listView.scrollPhysics,
        FFScrollPhysics.FF_SCROLL_PHYSICS_NEVER,
      );
    }
    final detail = findPage(result, name: examplePageName)!;
    final buttons = findDescendants(
      detail.node,
      (node) => node.type == FFWidgetType.Button,
    );
    expect(
      buttons.map((node) => node.props.button.text.textValue.inputValue),
      isNot(contains('Request Booking')),
    );
    expect(
      buttons.map((node) => node.props.button.text.textValue.inputValue),
      contains('Browse real deals'),
    );
  });

  test('Catalog starts live, examples require an explicit separate path', () {
    expect(discoveryState()['discoveryCatalog']!.defaultValue, 'live');
    expect(
      discoveryState(examples: true)['discoveryCatalog']!.defaultValue,
      'examples',
    );
    expect(
      discoveryState()['discoveryMapUrl']!.defaultValue,
      contains('catalog=live'),
    );
    expect(
      discoveryOffer.fields.keys,
      containsAll(['isDemo', 'canRequestBooking', 'listingId']),
    );
  });
}

FFProject fixture() {
  final initial =
      compileApp(
        buildApp((app) {
          app.struct('MobileAssistantCity', {'id': string, 'label': string});
          final listings = app.collection(
            'listings',
            fields: {'title': string},
          );
          app.customFunction(
            'goFunMotionListingReference',
            args: {'listingId': string},
            returns: docRef(listings),
            code:
                "return FirebaseFirestore.instance.collection('listings').doc(listingId);",
            description: 'Existing reference adapter.',
          );
          for (final handle in ff.Pages.all) {
            if (handle.name == exampleBrowseName ||
                handle.name == examplePageName)
              continue;
            app.page(
              handle.name,
              route: '/${handle.name}',
              params:
                  handle.name == 'DealsMapPage'
                      ? {
                        'id': string.withDefault(''),
                        'businessId': string.withDefault(''),
                      }
                      : handle.name == 'DealDetailPage'
                      ? {'listingRef': docRef(listings)}
                      : {},
              body: Scaffold(
                appBar: AppBar(title: handle.name),
                body: Column(
                  name: 'FixtureBody',
                  children: [
                    Text('Manual content', name: 'ManualBuilderContent'),
                    if (handle.widgets.all.any(
                      (widget) => widget.name == 'DiscoveryMapEntry',
                    ))
                      Row(
                        name: 'DiscoveryMapEntry',
                        children: [Text('Old map entry')],
                      ),
                    if (handle.name == 'DiscoverPage' ||
                        handle.name == 'DealsPage')
                      Column(
                        name: 'MarketplaceBrowsePanel',
                        children: [Text('Existing live feed')],
                      ),
                  ],
                ),
              ),
            );
          }
          app.bottomNav(
            items: [
              BottomNavItem('DiscoverPage'),
              BottomNavItem('FindPlanPage'),
              BottomNavItem('DealsPage'),
              BottomNavItem('SavedPage'),
              BottomNavItem('ProfilePage'),
            ],
          );
        }),
      ).project;
  final keys = <String, String>{};
  for (final handle in [
    ff.Pages.discoverPage,
    ff.Pages.dealsPage,
    ff.Pages.dealsMapPage,
  ]) {
    final page = findPage(initial, name: handle.name)!;
    keys[page.node.key] = handle.key;
    if (handle.name == 'DealsMapPage') {
      keys[findDescendants(
            page.node,
            (node) => node.name == 'FixtureBody',
          ).single.key] =
          handle.widgets.root.slots['body']!.single.key;
    } else {
      for (final widget in handle.widgets.all.where(
        (widget) => widget.name == 'DiscoveryMapEntry',
      )) {
        keys[findDescendants(
              page.node,
              (node) => node.name == 'DiscoveryMapEntry',
            ).single.key] =
            widget.key;
      }
      keys[findDescendants(
            page.node,
            (node) => node.name == 'MarketplaceBrowsePanel',
          ).single.key] =
          handle.widgets.all
              .singleWhere((widget) => widget.name == 'MarketplaceBrowsePanel')
              .key;
    }
  }
  Object? rekey(Object? value) => switch (value) {
    String() => keys[value] ?? value,
    List() => value.map(rekey).toList(),
    Map() => value.map(
      (key, value) => MapEntry(keys[key] ?? key, rekey(value)),
    ),
    _ => value,
  };
  return FFProject()..mergeFromProto3Json(rekey(initial.toProto3Json()));
}
