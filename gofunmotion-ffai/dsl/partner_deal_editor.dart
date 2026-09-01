import 'package:flutterflow_ai/flutterflow_ai.dart';
import 'package:flutterflow_ai/src/helpers/function_call_helpers.dart'
    show ConditionBranch, conditionalValueVar, dateTimeFromTimestampVar;
import 'package:flutterflow_ai/src/helpers/project_helpers.dart'
    show findStateField;
import 'package:flutterflow_ai/src/helpers/tree_helpers.dart'
    show findDescendants;
import 'package:flutterflow_ai/src/helpers/variable_helpers.dart'
    show
        varFromActionOutput,
        varFromGlobalProp,
        varFromPageParam,
        varFromPageState,
        varFromWidgetState;
import 'package:flutterflow_ai/src/helpers/variable_operation_helpers.dart'
    show apiResponseField, jsonPath, withOperations;

const partnerDealEditorName = 'PartnerDealEditorPage';

Object ensurePartnerDealEditor(
  App app, {
  ProjectPageHandle? existingPage,
  required Endpoint saveListing,
  required Endpoint improveTitle,
  required Endpoint improveDescription,
  required Object dashboard,
  required Object partnerListings,
  required Object signIn,
}) {
  if (existingPage != null) {
    app.editPage(existingPage, (page) {
      if (!existingPage.widgets.all.any(
        (widget) => widget.name == 'DealEditorCategoryLabel',
      )) {
        page.ensureInsertedBefore(
          existingPage.widgets.all.singleWhere(
            (widget) => widget.name == 'DealEditorCategoryDropdown',
          ),
          Text(
            'Category',
            name: 'DealEditorCategoryLabel',
            style: Styles.labelMedium,
          ),
        );
      }
    });
    app.raw(bindPartnerDealEditorValues);
    return existingPage;
  }
  final page = app.ensurePage(
    partnerDealEditorName,
    route: '/partner-deal-editor',
    description:
        'Native create/edit form for reviewed last-minute activity deals.',
    params: {
      'businessId': string.withDefault(''),
      'listingId': string.withDefault(''),
      'initialTitle': string.withDefault(''),
      'initialDescription': string.withDefault(''),
      'initialCategory': string.withDefault('classes'),
      'initialOriginalPrice': string.withDefault(''),
      'initialPrice': string.withDefault(''),
      'initialSpots': string.withDefault(''),
      'initialStartMillis': int_.withDefault(0),
      'initialEndMillis': int_.withDefault(0),
    },
    state: {
      'editingListingId': string.withDefault(''),
      'category': string.withDefault('classes'),
      'startsAtMillis': int_.withDefault(0),
      'endsAtMillis': int_.withDefault(0),
      'isSaving': bool_.withDefault(false),
      'saveState': string.withDefault('idle'),
      'errorMessage': string.withDefault(''),
    },
    onLoad: [
      If(
        const Global(GlobalProperty.isUserLoggedIn),
        then: [
          SetState('editingListingId', const PageParam('listingId')),
          SetState('category', const PageParam('initialCategory')),
          SetState('startsAtMillis', const PageParam('initialStartMillis')),
          SetState('endsAtMillis', const PageParam('initialEndMillis')),
        ],
        orElse: [Navigate(signIn, replaceRoute: true)],
      ),
    ],
    body: Scaffold(
      appBar: AppBar(title: 'Last-minute deal'),
      body: Container(
        padding: const EdgeInsets.all(20),
        child: Column(
          name: 'PartnerDealEditorContent',
          scrollable: true,
          crossAxis: CrossAxis.start,
          spacing: 16,
          children: [
            Text('Deal details', style: Styles.headlineSmall),
            Text(
              'Changes are reviewed before publishing.',
              style: Styles.bodyMedium,
              color: Colors.secondaryText,
            ),
            _reuseDealCard(partnerListings),
            TextField(name: 'DealEditorTitleField', label: 'Title'),
            _copyButton(
              endpoint: improveTitle,
              field: 'DealEditorTitleField',
              label: 'Improve title',
              output: 'editorTitleCopy',
            ),
            TextField(
              name: 'DealEditorDescriptionField',
              label: 'Description',
              maxLines: 4,
            ),
            _copyButton(
              endpoint: improveDescription,
              field: 'DealEditorDescriptionField',
              label: 'Improve description',
              output: 'editorDescriptionCopy',
            ),
            Text(
              'Category',
              name: 'DealEditorCategoryLabel',
              style: Styles.labelMedium,
            ),
            Dropdown(
              name: 'DealEditorCategoryDropdown',
              label: 'Primary category',
              value: const PageParam('initialCategory'),
              options: const [
                'classes',
                'creative',
                'date-night',
                'events',
                'family',
                'fitness',
                'food-drink',
                'friends',
                'kids',
                'nightlife',
                'outdoor',
                'wellness',
              ],
              onChanged: SetState('category', const WidgetValue()),
            ),
            Row(
              spacing: 12,
              children: [
                Expanded(
                  TextField(
                    name: 'DealEditorOriginalPriceField',
                    label: 'Was (USD)',
                    keyboard: Keyboard.number,
                  ),
                ),
                Expanded(
                  TextField(
                    name: 'DealEditorPriceField',
                    label: 'Now (USD)',
                    keyboard: Keyboard.number,
                  ),
                ),
              ],
            ),
            TextField(
              name: 'DealEditorSpotsField',
              label: 'Spots left',
              keyboard: Keyboard.number,
            ),
            Text('Availability', style: Styles.titleMedium),
            Text(
              'Dates below use your device timezone.',
              style: Styles.bodySmall,
              color: Colors.secondaryText,
            ),
            _dateControl('Starts', 'startsAtMillis', 'EditorStart'),
            _dateControl('Ends / expires', 'endsAtMillis', 'EditorEnd'),
            Text(
              'Draft saved. It is not visible to customers.',
              name: 'DealEditorDraftConfirmation',
              style: Styles.bodyMedium,
              color: Colors.success,
              visible: Equals(State('saveState'), 'draft'),
            ),
            Text(
              'Submitted for review. It will appear after approval.',
              name: 'DealEditorSubmitConfirmation',
              style: Styles.bodyMedium,
              color: Colors.success,
              visible: Equals(State('saveState'), 'submit'),
            ),
            Text(
              State('errorMessage'),
              name: 'DealEditorSaveError',
              style: Styles.bodyMedium,
              color: Colors.error,
              visible: Equals(State('saveState'), 'error'),
            ),
            Text(
              'Saving...',
              style: Styles.bodyMedium,
              visible: State('isSaving'),
            ),
            Button(
              'Save Draft',
              name: 'DealEditorSaveDraftButton',
              icon: 'save',
              width: double.infinity,
              height: 48,
              borderRadius: 8,
              variant: ButtonVariant.outlined,
              textColor: Colors.primaryText,
              onTap: _saveActions(saveListing, 'draft'),
            ),
            Button(
              'Submit for Review',
              name: 'DealEditorSubmitButton',
              icon: 'send',
              width: double.infinity,
              height: 48,
              borderRadius: 8,
              onTap: _saveActions(saveListing, 'submit'),
            ),
            Button(
              'Back to Your Deals',
              name: 'DealEditorBackButton',
              icon: 'arrow_back',
              width: double.infinity,
              height: 44,
              borderRadius: 8,
              variant: ButtonVariant.text,
              textColor: Colors.primaryText,
              onTap: Navigate(dashboard, replaceRoute: true),
            ),
          ],
        ),
      ),
    ),
  );

  // These are native Builder property bindings, not custom runtime code.
  app.raw(bindPartnerDealEditorValues);
  return page;
}

void ensurePartnerDealReuseCard(
  App app,
  ProjectPageHandle page,
  Object partnerListings,
) {
  app.editPage(page, (edit) {
    final reuse = page.widgets.all.where(
      (widget) => widget.name == 'DealEditorReuseCard',
    );
    if (reuse.isEmpty) {
      edit.ensureInsertedBefore(
        page.widgets.all.singleWhere(
          (widget) => widget.name == 'DealEditorTitleField',
        ),
        _reuseDealCard(partnerListings),
      );
    } else {
      edit.ensureReplaced(reuse.single, _reuseDealCard(partnerListings));
    }
  });
}

Container _reuseDealCard(Object partnerListings) => Container(
  name: 'DealEditorReuseCard',
  width: double.infinity,
  padding: const EdgeInsets.all(14),
  borderRadius: 8,
  color: Colors.secondaryBackground,
  borderColor: Colors.alternate,
  borderWidth: 1,
  child: Column(
    crossAxis: CrossAxis.start,
    spacing: 10,
    children: [
      Row(
        spacing: 10,
        children: [
          const Icon('history_outlined', size: 22, color: Colors.tertiary),
          Expanded(Text('Reuse a past deal', style: Styles.titleSmall)),
        ],
      ),
      Text(
        'Open an existing deal, duplicate it as a private draft, then add new availability and spots.',
        style: Styles.bodySmall,
        color: Colors.secondaryText,
      ),
      Button(
        'Choose a past deal',
        name: 'DealEditorChoosePastDealButton',
        icon: 'content_copy_outlined',
        width: double.infinity,
        height: 48,
        borderRadius: 8,
        variant: ButtonVariant.outlined,
        textColor: Colors.primaryText,
        onTap: Navigate(
          partnerListings,
          params: {'id': '', 'businessId': const PageParam('businessId')},
        ),
      ),
    ],
  ),
);

Button _copyButton({
  required Endpoint endpoint,
  required String field,
  required String label,
  required String output,
}) => Button(
  label,
  name: '${field}AiButton',
  icon: 'auto_awesome',
  height: 44,
  borderRadius: 8,
  variant: ButtonVariant.text,
  textColor: Colors.primaryText,
  onTap: ApiCall(
    endpoint,
    outputAs: output,
    params: {
      'businessId': const PageParam('businessId'),
      'category': State('category'),
      'text': WidgetState(field, WidgetStateProperty.text),
      'token': const AuthUser(AuthUserField.jwtToken),
    },
    onSuccess:
        (result) => [
          SetFormField(field, result['text']),
          Snackbar('Review the wording before saving.'),
        ],
    onFailure: [
      Snackbar('Could not improve the wording. Your text is unchanged.'),
    ],
  ),
);

Column _dateControl(String label, String field, String prefix) => Column(
  crossAxis: CrossAxis.start,
  spacing: 8,
  children: [
    Text(label, style: Styles.labelMedium),
    Text(
      State(field),
      name: '${prefix}DateLabel',
      style: Styles.bodyMedium,
      visible: Not(Equals(State(field), 0)),
    ),
    Button(
      'Choose date and time',
      name: '${prefix}DateButton',
      icon: 'calendar_month',
      height: 48,
      width: double.infinity,
      borderRadius: 8,
      variant: ButtonVariant.outlined,
      textColor: Colors.primaryText,
      onTap: [
        DatePicker(
          mode: DatePickerMode.dateTime,
          allowPast: true,
          outputAs: '${prefix}Picked',
        ),
        If(
          Not(Equals(ActionOutput('${prefix}Picked'), null)),
          then: [SetState(field, 0)],
        ),
      ],
    ),
  ],
);

List<DslAction> _saveActions(Endpoint endpoint, String mode) => [
  If(
    Not(State('isSaving')),
    then: [
      SetState('isSaving', true),
      SetState('saveState', 'idle'),
      ApiCall(
        endpoint,
        outputAs: '${mode}EditorSave',
        params: {
          'availableFromMillis': State('startsAtMillis'),
          'availableUntilMillis': State('endsAtMillis'),
          'businessId': const PageParam('businessId'),
          'category': State('category'),
          'description': WidgetState(
            'DealEditorDescriptionField',
            WidgetStateProperty.text,
          ),
          'listingId': State('editingListingId'),
          'originalPrice': WidgetState(
            'DealEditorOriginalPriceField',
            WidgetStateProperty.text,
          ),
          'price': WidgetState(
            'DealEditorPriceField',
            WidgetStateProperty.text,
          ),
          'remainingSpots': WidgetState(
            'DealEditorSpotsField',
            WidgetStateProperty.text,
          ),
          'saveMode': mode,
          'title': WidgetState(
            'DealEditorTitleField',
            WidgetStateProperty.text,
          ),
          'token': const AuthUser(AuthUserField.jwtToken),
        },
        onSuccess:
            (result) => [
              SetState('editingListingId', result['listingId']),
              SetState('saveState', mode),
              SetState('isSaving', false),
            ],
        onFailure: [
          SetState(
            'errorMessage',
            'Could not save. Check your connection and try again.',
          ),
          SetState('saveState', 'error'),
          SetState('isSaving', false),
        ],
      ),
    ],
  ),
];

void bindPartnerDealEditorValues(FFProject project) {
  final page = findPage(project, name: partnerDealEditorName);
  if (page == null) throw StateError('Partner deal editor was not created.');
  FFNode node(String name) =>
      findDescendants(page.node, (n) => n.name == name).single;

  const fields = {
    'DealEditorTitleField': 'initialTitle',
    'DealEditorDescriptionField': 'initialDescription',
    'DealEditorOriginalPriceField': 'initialOriginalPrice',
    'DealEditorPriceField': 'initialPrice',
    'DealEditorSpotsField': 'initialSpots',
  };
  for (final entry in fields.entries) {
    final param = page.params.values.singleWhere(
      (p) => p.identifier.name == entry.value,
    );
    node(entry.key).props.textField.initialText = FFText(
      textValue: FFStringValue(variable: varFromPageParam(param.identifier)),
    );
  }

  for (final name in [
    'DealEditorTitleFieldAiButton',
    'DealEditorDescriptionFieldAiButton',
    'EditorStartDateButton',
    'EditorEndDateButton',
    'DealEditorSaveDraftButton',
    'DealEditorBackButton',
  ]) {
    final button = node(name).props.button;
    final color = FFColorValue(
      inputValue: FFColor(themeColor: FFColor_ThemeColor.PRIMARY_TEXT),
    );
    button.text.colorValue = color;
    if (button.iconValue.hasInputValue()) {
      button.iconValue.inputValue.colorValue = color.deepCopy();
    }
  }

  for (final entry
      in {
        'EditorStart': 'startsAtMillis',
        'EditorEnd': 'endsAtMillis',
      }.entries) {
    final field =
        findStateField(
          project,
          widgetClassName: partnerDealEditorName,
          fieldName: entry.value,
        )!;
    final timestamp = varFromPageState(field.parameter.identifier)
      ..nodeKeyRef = FFNodeKeyReference(key: page.node.key);
    final formatted = dateTimeFromTimestampVar(timestamp).variable;
    formatted.operations.add(
      FFVariableOperation(
        dateTimeFormat: FFDateTimeFormat(
          format: 'MMM d, yyyy h:mm a',
          isCustom: true,
        ),
      ),
    );
    node('${entry.key}DateLabel').props.text.textValue = FFStringValue(
      variable: formatted,
    );

    final button = node('${entry.key}DateButton');
    final actions =
        button.triggerActions
            .expand((trigger) => _walkActions(trigger.rootAction))
            .toList();
    final picker = actions.singleWhere(
      (action) => action.action.hasDatePicker(),
    );
    // Native codegen uses the default on Cancel after a previous selection.
    // Keep that default equal to the selected value, not the current clock.
    picker.action.datePicker
      ..useDefaultTheme = true
      ..allowPast = true
      ..defaultDateTime = FFValue(
        variable: conditionalValueVar(
          branches: [
            ConditionBranch(
              condition: FFVariable(
                source: FFVariableSource.FUNCTION_CALL,
                functionCall: FFFunctionCall(
                  condition: FFCondition(
                    relation: FFCondition_Relation.GREATER_THAN,
                  ),
                  values: [
                    FFValue(variable: timestamp.deepCopy()),
                    FFValue(inputValue: FFParameterValue(serializedValue: '0')),
                  ],
                ),
              ),
              value: FFValue(
                variable:
                    dateTimeFromTimestampVar(timestamp.deepCopy()).variable,
              ),
            ),
          ],
          elseValue: FFValue(
            variable: varFromGlobalProp(
              FFGlobalPropertiesVariable_GlobalProperty.CURRENT_TIMESTAMP,
            ),
          ),
          returnType: FFParameter(
            dataType: FFDataTypeV2(scalarType: FFBaseDataType.DateTime),
          ),
        ),
      );
    final update = actions
        .expand((action) => action.action.localStateUpdate.updates)
        .singleWhere((update) => update.fieldIdentifier.name == entry.value);
    // Date pickers expose widget state, not a generic API action output.
    final picked = varFromWidgetState(
      type: FFWidgetStateVariable_ActionVariableType.DATE_PICKER,
      actionKeyRef: FFActionKeyReference(key: picker.action.key),
    )..nodeKeyRef = FFNodeKeyReference(key: button.key);
    final condition = actions.singleWhere(
      (action) => action.hasConditionActions(),
    );
    condition.conditionActions.trueActions.single.condition = FFActionCondition(
      variable: FFVariable(
        source: FFVariableSource.FUNCTION_CALL,
        functionCall: FFFunctionCall(
          condition: FFCondition(
            relation: FFCondition_Relation.EXISTS_AND_NON_EMPTY,
          ),
          values: [FFValue(variable: picked.deepCopy())],
        ),
      ),
    );
    final output =
        picked.deepCopy()
          ..operations.add(
            FFVariableOperation(
              dateTimeToInteger: FFDateTimeToInteger(
                unitType: TimeUnitType.MILLISECOND,
              ),
            ),
          );
    update.setValue = FFValue(variable: output);
  }

  for (final entry
      in {
        'draft': 'DealEditorSaveDraftButton',
        'submit': 'DealEditorSubmitButton',
      }.entries) {
    final actions =
        node(entry.value).triggerActions
            .expand((trigger) => _walkActions(trigger.rootAction))
            .toList();
    final request = actions.singleWhere(
      (action) => action.action.outputVariableName == '${entry.key}EditorSave',
    );
    final errorUpdate = actions
        .expand((action) => action.action.localStateUpdate.updates)
        .singleWhere((update) => update.fieldIdentifier.name == 'errorMessage');
    final error = withOperations(
      varFromActionOutput(
        actionKey: request.action.key,
        outputName: '${entry.key}EditorSave',
      )..nodeKeyRef = FFNodeKeyReference(key: node(entry.value).key),
      [
        apiResponseField(FFApiResponseField_ResponseField.JSON_BODY),
        jsonPath(r'$.error'),
      ],
    );
    error.defaultValue = FFParameterValue(
      serializedValue: 'Could not save. Check your connection and try again.',
    );
    errorUpdate.setValue = FFValue(variable: error);
  }
}

Iterable<FFActionNode> _walkActions(FFActionNode node) sync* {
  yield node;
  for (final branch in node.conditionActions.trueActions) {
    yield* _walkActions(branch.trueAction);
  }
  if (node.conditionActions.hasFalseAction())
    yield* _walkActions(node.conditionActions.falseAction);
  if (node.hasFollowUpAction()) yield* _walkActions(node.followUpAction);
}
