## Implementation Related Notes

Purpose of this section is to document things of interest related to the code so that they are here for posterity to refer back to for the original developer or anyone trying to maintain this code

* package.json composition related
    * Why is react-scripts listed as a dev dependency
        * https://github.com/facebook/create-react-app/issues/4617
    * Trying to fix critical vulnerabilities found this post
        * https://stackoverflow.com/questions/15806152/how-do-i-override-nested-npm-dependency-versions/48524488#48524488
            * So bringing in npm-force-resolutions
    * Trying to fix issues raised when upgrading react-scripts to 5.0.0, using the postinstall script to fix semantic-ui-css extra semicolon issue
        * https://github.com/Semantic-Org/Semantic-UI-React/issues/4287#issuecomment-1016579332
            * This will get rid of using preinstall script (removed npm-force-resolutions)

* React technology related
    * Why are dropdowns re-populated on every visible control change?  Is that expected?
        * Relevant:  https://www.freecodecamp.org/news/react-shouldcomponentupdate-demystified-c5d323099ef6/
        React keeps copy of old and new DOM and does a difference and only udpates differences.  Lifecycle method shouldComponentUpdate might be used to have more control on which components should update when, but usage is discouraged.  Would need to check if nextProps are different from current props.  Something like ImmutableJS might be used to make such comparisions more efficient.
        Since DOM Diffing causing only area of screen that has changed....it should be mostly fast enough
        * Breaking up to smaller components would help minimizing the render to only the ones impacted (yet, not sure when a container component wraps all these).  Reducers are supposed to help this.
    * React Reducers (Redux): https://redux.js.org/tutorials/fundamentals/part-1-overview
    * React and event.preventDefault(): https://medium.com/@ericclemmons/react-event-preventdefault-78c28c950e46
    * componentWillReceiveProps has been deprecated...so replaced occurrence of this in PegaApp.js with getDerivedStateFromProps
    * componentWillUpdate has been deprecated....so replaced occurrences with componentDidUpdate
    * The key attribute must be unique across siblings in the DOM node hierarchy
        * https://dev.to/nibble/passing-jsx-key-attribute-to-elements-in-react-5c58

* Pega terminology related
    * Within the code (particularly within PegaForm component), "view" refers at time to the section configured within a "Flow Action" and at other times to a "Section" embedded within another "Section"
    * Within the code (particularly within PegaForm component), "page" refers to "Harness"

* Workbaskets (or Workqueues) related
    * The list of workqueues for an operator are returned as an array within the pyWorkbasket property for the D_OperatorID data page

* Workitem related
    * The list of workitems are retrieved from either the D_Worklist data page (which supports two params: WorkGroup and OperatorID--neither of which are currently utilized) and the D_WorkBasket (which supports two params: WorkGroup and WorkBasket).  We employ the WorkBasket param to specify which WorkBasket should be utilized.  Login as Manager.Cableco with the sample app to exercise this.

*  Casetypes related
    * We add to the New menu all the startingProcess names within any of the casetypes which have "CanCreate" set to "true".  When such a "New" harness is required, the starting processID is stored within Pages state so that it can be utilized on the subsequent POST /cases transaction once the initial field values have been obtained.

*  Event handler related
    * handleEvent considers the action sets configured for a control and generates an HTTP transaction if appropriate
    * handleChange does not consider and take action on action sets unless you pass handleEvent as a callback to this function.  It does update maintained state.  The DATETIME control is treated specially as the first parameter it sends back is a date (and not an event).
    * handleNamedEvent provides a way to filter on a particular event.  It should be used when a control is considering events during onChange handling (via specifying handleEvent as the callback).  In those cases it should use handleNamedEvent for any onBlur handling.
    * For text controls we opt to not consider fired events on every change but only on blur
    * Since it is common to have embedded section visibility change on a radio button click, checkbox, dropdown select and autocomplete select, these are wired to consider configured action sets on change.  Other controls it is preferable to do this only on blur.
    * For fields with actionSets, createEventHandler utilizes a Array.reduce with a promise.  See:
        * https://css-tricks.com/why-using-reduce-to-sequentially-resolve-promises-works/

* Using anonymous functions for event handlers vs. defined functions/methods.
    * Anonymous functions must be recreated every render loop.  With a dedicated handler a function instance is only created once
    * Anonymous/arrow functions also allow accessing other vars in context

* Pega fields and the modes array
    * The modes[0] and modes[1] evolved from the Pega control attributes within the Pega properties dialog.  (In Pega this is modes[1] and modes[2] as Pega has 1-based arrays.).  The first modes array entry represents what within the Properties Presentation sub-tab typically had within the Editable groupings and the 2nd modes array entry represents things within readonly groupings.

* Text input fields and the ENTER key
    * To properly simulate what Pega web experience does best way to eat the ENTER key for only INPUT controls is to add an onKeyPress handler to all such controls.
    * Also for the main form Buttons, the type="button" designation is important as otherwise the button click event generated by ENTER would be for the first button rather than the type="submit" button.

* OAuth library migration from JSO (to oidc-client) to internal implementation
    * Various pages were originally created to prototype alternate login user experiences (and were originally done with the JSO library).  Only the default Main and Popup loginBoxType have been fully converted from JSO so far.
        * `loginBoxType.Main` correlates to replacing the entire application window contents with the OAuth provider login page (this is the default and only one "supported" within the React Starter Pack app).  This variant relies on the `StartPage` component.
        * `loginBoxType.Popup` correlates to opening up a separate browser window and having the OAuth provider login UI surface there.  This variant relies on the `PopupPage` component.
        * `loginBoxType.Modal` correlates to opening up inline modal dialog and displaying the OAuth provider login UI there.  This gets much more complicated as enough space needs to be allocated for the display of that page within an iframe.  This variant relies on the `IframePage` component.  The OAuth provider's login page also needs to support being surfaced within an iframe for this variant to work.  The default Pega login page does not.

* Pega OAuth related
    * OAuth support is intended to exercise the default "OAuth 2.0" configuration for the "api" service package
    * Pega Infinity releases prior to 8.7 do not support enabling refresh tokens or the revoke endpoint for Public clients using "Authorization Code" grant flow.

* Routing
    * PrivateRoute.js is where the initial route is determined to /start or /login page based on whether endpoints.use_OAuth is true or false

* Field validations and Formsy
    * The package is using formsy-semantic-ui-react and formsy-react for much improved required field validations
    * Form no longer has a onSubmit handler but rather a onValidSubmit handler
    * The 3rd arg to the onSubmit for the form is a invalidateForm callback which appears to invoke the updateInputsWithError method off the Formsy.Form element
        * Finding invoking updateInputsWithError directly is not working in the case of "Save" button click, when a server validation error is encountered.  Was struggling with getting the proper validation message displayed for the relevant field.  Believe it is related to this issue:
            * https://github.com/formsy/formsy-react/issues/89
        Found a workaround by using an "undocumented" API (setFormPristine)
    * For these validation messages to display properly, a supported wrapped Formsy element (like Input) must wrapper the custom element (as being done for Dropdown and Datetime)
    * Some useful info on Formsy
        * https://www.npmjs.com/package/formsy-semantic-ui-react
        * https://github.com/zabute/formsy-semantic-ui-react
        * https://github.com/formsy/formsy-react/blob/master/API.md

*  DROPDOWN (pxDropdown) implementation
    * "datapage" dropdowns are implemented as a custom component (DataPageDropdown).  The other two variants "pageList" and "locallist" are supported by the Semantic-UI Form.Dropdown component.  The code is presently treating "locallist" as an else.  Perhaps it should be explicitly handled and if any other values for listSource are encountered a console log of unexpected should be emitted?  If those were reasonable ways to specify drop down entries, would such options be located within same fields as they are now for locallist?
    * DataPage dropdowns were more complex and hence were broken out to leverage it's own custom component.  If this is refactored in future to have a distinct component for every pega control type, then all might be merged into this one component.
    * When options are driven by Property with "Prompt list", then it appears only options.value might be encoded.  However, when using "Local list", both these values may be encoded.

* AUTOCOMPLETE (pxAutoComplete) implementation
    * Unlike the current DROPDOWN implementation, all editable pxAutoComplete fields will instantiate a custom component (PegaAutoComplete).  When leveraging the options values within the field's control structure, each options entry will have a key, value and (possibly) a tooltip entry.  "key" is the primary displayed value within the autocomplete field and the dropdown, "value" is a description and "tooltip" is additional description.
    * When configured to use a DataPage, the retrieval of the data within options occurs at the time the screen is first rendered.  A capability to do "live fetches" was added but requires that a DXAPI custom property with the name "$LiveFetch" be created and that it contain as a value the name of the Data Page query param to use to retrieve the partial set of entries based on the value currently entered in the field.  The query param needed to be explicitly specified because the "use for search" checkbox value is not currently available within the JSON which defines the field.  The arrow down key can also be used to trigger a fetch when less than min chars has been specified.

* IMAGE (pxIcon) implementation
    * Based on iconSource property value renders different content
        * standardIcon ("Standard Icon"): Maps iconStandard property value to Semantic-UI Icon tag name value (looked up from standardIcons object defined in FormConstants.js)
        * image ("Image"): The image specified by iconImage property values can't be retrieved from pega from the DX API application context.  Images might be duplicated within local assets/img directory and then dynamically loaded and displayed as a data url.  Also offers code to just have this always display an image not available icon.
        * exturl ("External URL"): Renders an HTML img tag with src set to iconUrl property value
        * property ("Property"): Renders an HTML img tag with src set to iconProperty property value
        * styleclass ("Icon class"): Removes any occurrences of "pi pi-" and converts any hyphen to _ and then attempts to display the resultant semantic ui icon equivalent

* LINK (pxLink) implementation
    * Based on iconSource property value renders different content for
        * image ("Simple Image"):
        * property ("Property"):
        * styleclass ("Icon class"):

* RADIOBUTTONS (pxRadiobuttons) implementation
    * Doesn't have code to explicitly retrieve data from non-"locallist" sources (DataPage or ClipboardPage).  Rather it relies on the API to access these pages and populate the "locallist" values.  For examples of how to access DataPage or ClipboardPage listsources see pxDropDown or pxAutocomplete.

* REPEATING DYNAMIC LAYOUT implementation
    * This term "Repeating Dynamic Layout" refers to when groupFormat value is "Dynamic" and layoutFormat is "REPEATINGLAYOUT"

* DATEPICKER
    * Best info on this component:
        * https://reactdatepicker.com/
    * react-datepicker is using the date-fns library as well (was using moment at one time)
    * The react-datepicker does generate synthetic onBlur events.  But they don't seem to fire if an onchange fired due to a date selection (as opposed to typing a value).  (see https://github.com/Hacker0x01/react-datepicker/issues/2028).  On change does cause many events to be fired if typing and typing valid dates.  Was at one point using lodash debouncing, but have now moved to distinguishing clicks vs text input and only sending the action handler on clicks and blurs.
    * Used customInput attribute initially to get calendar icon rendered to right, but found some differences in input handling when entering dates, so went with simpler approach.
    * Some good usage examples:
        * https://www.positronx.io/react-datepicker-tutorial-with-react-datepicker-examples/
        * https://www.newline.co/@dmitryrogozhny/how-to-add-date-picker-in-react-with-react-datepicker--39ea1b57
    * customInput arg example (see https://stackoverflow.com/questions/50391206/custom-input-field-on-datepicker)

* Understanding Pega Layouts and what is supported
    * See https://community.pega.com/knowledgebase/articles/user-experience/85/layouts-dx-api
    * layout.groupType seems to correlate to specific layouts as well as grouping used within individual visual template choices
    * The code doesn't presently inspect layout.formatType values of SCREENLAYOUT, SIMPLELAYOUT (Dynamic layout), REPEATINGROW (Repeating Dynamic Layouts), or TABLELAYOUT (Grid), but rather supports these by coping with other layout properties such as layout.groupType

* Understanding Page Instructions
    * See https://community.pega.com/sites/default/files/help_v85/procomhelpmain.htm#pega_api/pega-api-queue-user-operations-by-using-pega-apis.htm
    * Page Instructions are available for "Embedded Pages", "Lists" (Page Lists) and "Groups" (Page Groups).  A leaf component (like a pxTextInput) when it gets a change event must determine what type of page instruction should be generated.  This determination should be based on context of the immediately containing groups element
        * If there is a groups.reference value, then it is an embedded page and should use "Embedded Pages" page instructions
        * If groups.reference is empty string, then if group.layout.reference has a value it will be a repeat.  group.layout.layoutFormat will indicate whether this repeat is a "REPEATINGLAYOUT" (RDL) or a "REPEATINGROW" (Grid/Table).  For either type of repeat...
            * group.layout.referenceType indicates whether
                * it is a "Group" (Page Group) and should use "Groups" page instructions
                * it is a "List" (Page List) and should use "Lists" page instructions
    * As part of the implementation when a change event is received, when pageInstructions are generated, we need to determine the referenceType of that reference.  The implementation creates a structure of layoutInfos to reference for all repeating grids or repeating dynamic layouts and indexes into the structure to get the referenceType.
        * A simpler way to determine the referenceType might be to parse the reference and if the rightmost parens contains a numeric or non-numeric value.  Lists should always be numeric and groups should always begin with an alpha character. (This is currently being used only as a fallback when a layout for the repeat isn't found)
    * When a refresh transactions causes a server side transform or activity to be invoked which changes the value or visibility of one or more fields within the current flow action, these changes will be lost unless comparable page instruction directives are generated to reflect these value changes driven by the server (not direct user interaction with the field).
    * [BUG-676173](https://agilestudio.pega.com/prweb/AgileStudio/app/agilestudio/bugs/BUG-676173) identifies issue with reference attribute missing for groupFormats of type "Dynamic".  Without this value, need to maintain some complex lookup table structures to allow correlating and encountered reference back to the proper associated layout structure.
    * V1MergeStrategy DSS setting with a value of "UPDATE" removes the need for page instructions for embedded page related values.  Page instructions for repeat structures are still worthwhile to reduce the amount of data sent particularly for large repeats.  This setting is available with 8.7, 8.6.1, 8.5.5 and 8.4.5.

* DXAPI PUT transactions
    * Technically should only send updated fields and not all form fields.  updateCase, refreshCase and performRefreshOnAssignment do PUT transactions
    * HOWEVER, Pega apps rely greatly on pre/post activities/transforms.  DX API will generate the JSON after having run the pre-processing activities...so this may result in additional fields being visible with values.  If these values aren't sent back, the app will likely not behave as intended

* PegaForm and values updates on refresh
    * When a new assignments refresh response comes back, the assignment reducer updates the Views entry for the caseID.  This triggers a componentDidUpdate event within the PegaForm which in turn was not considering existing state values when rebuilding the layout based on the JSON returned.  Mods to use the state will result in the current state value taking precedence over the value returned from server, but since it is a "refresh"...these client values should have just been posted and will be returned from the server.

* ScreenFlow implementation
    * This capability requires `use_v2apis` be set to `true` within endpoints.js and also requires that the `api` and `application` service packages are set to the same authentication type.  Note that the api/application/v2 endpoint is only available with Pega 8.5 or better, so the expectation is that `use_v2apis` is set to true only for servers that support this capability and are properly configured to have a common authentication type across the two service packages.
    * The implementation inspects the "navigation" and "actionButtons" properties within the assignments/{id} endpoint response and then leverages api/application/v2/navigation_steps/previous (with viewType value of "none") if the back button is found
    * Button labels were not available initially within DX API (til 8.5.4) (BUG-648395).  Hence, the "name" attribute if found is used.  Otherwise, it uses labels defined in FormConstants.js.  Original implementation used a different label constant ("Finish") for the final submit, but looks like that "submit" button also has the same "Submit" label within the JSON response.
    * The presence of the Save button was not initially available within DX API (til 8.5.4) (BUG-650067).  Now finding it grouped with "Secondary" buttons rather than "Main".  Opted to continue displaying Save as a primary button (on right side rather than the left).  Code might be modified to honor the specified location.
    * Wasn't clear how to dynamically invoke a specific behavior for some other encountered button.  Hence, ignoring any unexpected buttons for now.

* Enabling testID attribute within JSON output
    * Must have the PegaRULES:TestID role specified within the user's access group (See https://docs.pega.com/whats-new-pega-platform/manage-test-id-access-access-group-role-82 )

* The caseID attribute for internal components and subcases
    * Subcases have not been extensively tested with the starter pack.  There was one scenario where the initial top level case would immediately start a sub case.  To properly support tha scenario, the caseID parameter passed into WorkObject and then down to PegaForm is always expected to be the top case ID.  At some point the attribute name might change to better reflect this.
    * At present the saved responses via the assignments reducer are using the top case id as well.  We may want to change this to support some way to associate case and subcase ids...but this is not presently done.

* First-Use Assembly (FUA)
    * DSS setting v1DXAPIFUA with a value of "true" can be used in 8.8, 8.7.1, 8.6.4 and 8.5.6 for significant runtime performance improvements for .../refresh transactions.

* Deployment
    * https://create-react-app.dev/docs/deployment/#other-solutions
        * Discusses workarounds for serving up other client routed paths when deployed on assorted web servers
        * Set homepage within package.json and then use process.env.PUBLIC_URL
        * See also:
            * https://skryvets.com/blog/2018/09/20/an-elegant-solution-of-deploying-react-app-into-a-subdirectory/
            * https://create-react-app.dev/docs/advanced-configuration/

* Service Workers
    * Service workers used to add offline-first behavior for your application. More information about Service Workers can be found here, https://medium.com/@gkverma1094/service-workers-a-detailed-look-83336036c1af
    * As we are not so focused on offline or caching behavior we have unregistered service workers. If you want to register the service worker inside this application follow the steps mentioned in this link, https://stackoverflow.com/a/67018656 
