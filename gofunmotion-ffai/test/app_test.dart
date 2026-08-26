import 'package:flutterflow_ai/flutterflow_ai.dart';
import 'package:test/test.dart';

import '../dsl/create.dart' as gofunmotion;
import '../dsl/edit.dart' as gofunmotionEdit;

void main() {
  test('GoFunMotion bound-project edit flow can be declared', () {
    expect(
      () => buildApp(gofunmotionEdit.buildGoFunMotionDealsQueryGuard),
      returnsNormally,
    );
  });

  test('GoFunMotion Deals DSL app compiles', () {
    final app = buildApp(gofunmotion.buildGoFunMotionDeals);
    final project = compileApp(app).project;

    final discoverPage = findPage(project, name: 'DiscoverPage');
    final findPlanPage = findPage(project, name: 'FindPlanPage');
    final dealsPage = findPage(project, name: 'DealsPage');

    expect(discoverPage, isNotNull);
    expect(findPlanPage, isNotNull);
    expect(dealsPage, isNotNull);
    expect(discoverPage!.node.type, FFWidgetType.Scaffold);
  });
}
