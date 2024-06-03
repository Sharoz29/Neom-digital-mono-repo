## Key Updates Since release SP-R.88.6
* Fix issue with authService value change in endpoints.js not being immediately honored (within same browser tab).
* Support single selection of row within Grid by using regular radio button control with property 'pySelected' (rather than LocalRadio field type)

## Key Updates Since release SP-R.87.5
* Obfuscated fields should display as masked values.
* Fixed a section headings display issue.
* Fixed issue with readOnly field prompt values not being displayed.
* Fixed scroll position issue on submit of form.
* Fixed incorrect checkbox auto-selection when previous screen contains a checkbox field. 
* Fixed Playwright script issue in embedded mode (non-screen flow case).
* Fixed spacing issue in the 2 column grid.
* Fixed missing labels and selection issues with LocalRadio fields.

## Key Updates Since release SP-R.87.4
* Playwright-based functional tests for CableConnect sample application.
* Support for **pxAttachContent** control and new *Show Attachments* checkbox within *settings* modal to control the attachment widget's visibility.
* Support openAssignment actionSet action for both hardcoded and property reference assignments.

## Key Updates Since release SP-R.87.3
* New `Embedded` example to illustrate how separate self-service React apps might leverage WorkObject component.
* Unregistered Service Worker creation to get rid of production deployment issue.
* Adjusted redirect URI expected for deployments to include 'auth' route.
* Leveraging private methods within PegaAuth.js since react-scripts 5.0 now supports this.

## Key Updates Since release SP-R.87.2
* Fixed issue with "Get Next Work" occasionally returning empty screen (flow action area).

## Key Updates Since release SP-R.87.1
* Removed "eval" function call due to its security concerns, using Function() constructor now which is safer and efficient than eval.
* Fixed more issues with adding and deleting grid rows.
* Fixed several issues related to "New harness".
* Autocomplete support for showing results on down arrow.  Also fix for parameterized data pages not properly displaying results.
* Expose section name used for case details within settings to offer greater flexibility (might be useful for Theme-Cosmos...as pyCaseDetails does not exist for that theme).
* Support large data set searches (Live Fetch) within autocomplete.  Requires setting a DXAPI Custom attribute named $LiveFetch and the value needs to be the DP param name which should be used for the live search.
* Added appAlias property within endpoints.js to enable operators accessing secondary apps configured within their operator record.
* Hide grid's Add Row/Delete Row buttons when layout.displayGridFooter is false (only available when v1DXAPIFUA DSS setting is enabled).
* Fixed a SP-R.87.1 introduced regression with focus being lost as typing within a text input field within a grid.
* Fixed issue with selecting checkbox fields within grids.
* Fixed error on submit and save operations when privileges pxPerformAssignmentDX and pxUpdateCaseDX are in use.  This is related to posting field values for fields which are no longer displayed because of a specified visibility when.

## Key Updates Since release 1.5
* Dropdowns can now be quickly filtered to see entries that begin with entered chars
* Hide grid's Add Row/Delete Row buttons if rowEditing is set to readOnly
* Handle number decimal places value auto (-999) scenario
* Selected dropdown values may now be cleared 
* POST_VALUE action type support added back
* Added support for Cancel action set and optionally showing close button in the confirm page 
* Replaced usage of large oidc-client external library with own OAuth implementation (within PegaAuth.js)
* Separated single Use Page Instructions setting into two to allow disabling usage for Embedded Pages while enabling for Page Groups and Page Lists.  Page instructions for Embedded Pages can now be disabled when v1MergeStrategy DSS setting is utilized.
* Examine server related field value changes as part of a refresh and generate corresponding Page Instructions if appropriate
* New setting to display all workgroup workbaskets (in addition to the main user worklist and any workbaskets explicitly associated within the current operator record)
* Honor specified display range (Next X Years, Previous Y Years) settings for pxDateTime fields (requires recent 8.7 DX API update)
* Fixed issue with inability to open cases which immediately creates a child case and first visible step is an assignment within the child case
* Upgraded react-scripts to 5.0.0
* pr-field-* classnames are now available for all root elements which implement a specific field/control so they may be better styled via CSS
* Fixed various issues with adding and deleting grid rows
* Updated Page Instructions generation to fix issue with updating Pages within a Page List or Page Group

## Key Updates Since release 1.4
* Updates to utilize the "name" attribute if present within actionButtons (with 8.5.4)
* Modified openAssignments store array to contain both a caseID and an assignmentID (rather than just caseIDs)
* Added .env.development file to pickup a certificate (private.pem) and key (private.key) from ~/keys/ folder for when starting server via 'npm run starthttps'
* Fixed issue with date field not starting out empty (was causing issues with content and page instructions) (BUG-673716)
* Changed references of field.name to field.fieldID as field.name is not a returned property for fields
* Add required indicator for radio button groups and honor horizontal placement property
* Add a icon within datetime picker input field
* Add utilization of timepicker when datetime field is not date only
* Add support for "auto" datetime fields
* Use Formsy for Semantic UI React for improved required validations
    * Multiple required validations are now displayed at once visibly on form
    * Fixed issues with required validations not working for radio button groups and dropdowns and autocompletes
    * Fix issue with checkboxes with label on left not working properly after these changes
    * Fix quick display and hide of validation onChange of a field with actionSets (BUG-680645)
* Formsy now also used for returned server validation errors
    * ValidationMessages with an unknown Path were not being displayed (BUG-666382)
* Formsy used to support validation for when min and max character lengths are specified for a field
* Displayed Version string moved to new AppConstants.js file
* Moved react-scripts to Dependencies from devDependencies in package.json (as this is where it is placed by create-react-app)
* Removed code blocking assignment open if not assigned to current user, resulting in issues when using work queues. (BUG-672452)
* Increased individual REST API transaction timeout threshold from 5 seconds to 30 seconds
* Fixed JS exception occurring when attempting to edit fields within a repeating dynamic layout when page instructions setting is enabled (BUG-670830)
* Fix react warning of non-unique key when two casetypes have the same value
* Fix exception when selecting autocomplete option with keyboard return key (BUG-673761)
* Fix autocomplete results not having a limited height and offering results scrolling (BUG-673695)
* Added a new Settings field to specify additional /cases POST entries needed to open up a specific case within the Starter Pack.
* Fix issue with Autocomplete and DateTime fields not being properly cleared when a button is used to clear fields via a refresh that invokes a data transform (BUG-673683)
* Honor visibility property for labels (BUG-678824)
* Add support for pxRadioButton when property is a True-False type (BUG-671093)
* Fix an issue with getPropertyValue method when the state value is the empty string it was returning the passed in ".property" value
* Enabled scrollable year picker for datepicker control.  Too difficult to use for a birth year field (BUG-678835)
* Fix issue with readonly dropdown controls displaying the key and not the prompt value (BUG-678253)
* Adjust pxDropdown to not go to full width of container by default.  pr-dropdown style can be adjusted if desire this to be full width. (BUG-687336)
* Created new pr-layout CSS class names that are emitted for layout div containers to offer greater external adjustments.  Also setup CSS rule to have "Inline middle" groupFormat to use "inline-flex" (BUG-687337)
* Fix AutoComplete issues with entered characters not behaving well when field has a large number of entries and support searches against secondary fields (BUG-673698)
* Add client-side paging capability for all grids with greater than 5 rows
* Support for data-test-id attributes containing the testid property value
* Fix issue with create menu occasionally not having any casetypes listed
* Added mechanism to clear multiple alerts when present with a single button click
* Converted PegaAutoComplete component to a functional component and revised recent AutoComplete fixes to further improve behavior of AutoComplete field
* Fix for fields reserve space in inline wrapping layouts (Inline Middle). "Inline middle" layout should not use a grid
* Simplify endpoints.js by adding PEGAURL property
* Resolve issues with user edits being lost as a background refresh action completes by always showing Loader when refresh API call is in progress

## Key Updates Since release 1.3
* Upgraded to React 17.0.2 (from React 16.8)
* Replaced JSO library with oidc-client library for OAuth
* Replaced deprecated React lifecycle methods (componentWillReceiveProps and componentWillUpdate)
* Added graceful session re-authentication and consolidated OAuth related redirect urls to /auth
* Allow leveraging client_secret if specified (though not recommended for web clients)
* Support for silent re-authentication to get a new access_token when a refresh_token is present
* Adjust settings dialog so the default is the preferred DX API usage patterns (so now all options are checked)
* Fix issue with parameterized Data Page retrievals for Dropdown and Autocomplete not considering a assignment refresh update that might change the data page parameters to use to populate this component.
* Fix an exception in PegaForms.js related to layout.rows or row.groups being empty when attempting to access map method.
* Have appSettings state be referenced directly within PegaForm component
* Reverted back the "Save assignment" setting to not set (was causing issues for 8.3 users not realizing they need to turn it off)
* Add support for using Page Instructions for repeating Page Groups, Page Lists and Embedded Pages
* Changed the primary modes offset used for pxIcon from the first entry to the 2nd
* Fixed an issue where values for fields that are hidden (and later show) being lost during assignment refresh operations
* Support for "LocalRadio" field control type
* Support for "Local action" and Target types "Modal Dialog" and "Replace Current" to load a specified flow action
* When misconfiguration scenario, avoid repeated requests to casetypes
* Support for Screen flow for any screens which are part of a Multi-Step Form Process when using a Pega Infinity 8.5+
    * (by leveraging application/v2 navigation_steps endpoint)
* New application settings for leveraging Screen flow as well as whether save button should be displayed
* Fix "signinRedirect" seen when misconfigured (axios 401 interceptor was incorrectly being setup when configured for basic auth)
* Added "dirty flag" setting and checking this to avoid save on back and also to disable Save action until some mod was actually done.

## Key Updates Since release 1.2
* Upgraded to React 16.8 (from React 16.2)
* Adjusted layout of Dashboard title to consolidate actions on same row and eliminate extra top headers
    * Added Refresh action
* Support for OAuth Authorization Code grant flow (with or without PKCE)
* Upgraded datetime library being utilized from moment to date-fns
    * Upgraded date picker being utilized from react-dates (moment based) to react-datepicer (date-fns based)
* Fixed many issues with proper HTML decoding not being done on all visible UI fields
* Fixed issue with bounding double quotes not properly being stripped from property values
* Eliminated duplicating labels as a placeholder (when a placeholder isn't defined)
    * Added utilization of field specified placeholder
* Removed vertical column dividers for multi-column layouts
* Modified telephone field to use a canned placeholder only when no tooltip or placeholder is specified
* Removed occasional creation of stray horizontal group dividers
* Fixed warnings/error layout style to also consider bounding rectangle
* Casetypes response and case creation handling improvements
    * Fix case names in New menu to be the friendly names provided within the startingProcesses array
    * Include all the startingProcesses entries within the New menu (not just the first one)
    * Properly cope with casetype entries that are missing startingProcesses property
    * Stop hardcoding "pyStartCase" as the processID to use on POST /cases (rather always use ID value within startingProcesses entry)
* Image references relative to Pega app paths are not reachable, so display no image icon
* Enhance pxIcon and pxLink image handling to also leverage any classes in pega-icons as a fallback and share more common code
* Added "Settings" modal dialog and support for settings:
    * to utilize local options for Autocomplete and Dropdown fields configured to get values from a Data Page (The API now populates the options structure as it would for locallist sources, saving the additional transactions to retrieve the Data Page)
    * to utilize local options for Autocomplete and Dropdown fields configured to get values from a Clipboard Page
    * to use the preferred POST /assignments for the Save action within views.  This then allows for validation against the flow action properties.
* Support for pxNumber field control type
* BUG FIXES:
    * Dropdown fields were not executing configured onchange action sets (rather was doing it onblur)
    * RadioButton was not executing configured onchange action sets
    * ENTER key within INPUT field was executing the Cancel button (should do nothing)
    * Checkbox controls not interacting smoothly/properly
        * keyboard space key not working to toggle state
        * clicking on label of left positioned checkbox now working
        * able to select text within left positioned checkbox label
    * "Inline middle" group layout style was displaying poorly
    * Autocomplete datapage queries were not passing configured params
    * Paragraph field title (Layout title) was being center aligned rather than left aligned
    * OpenUrlInWindow action set action was not properly resolving another field property reference
    
