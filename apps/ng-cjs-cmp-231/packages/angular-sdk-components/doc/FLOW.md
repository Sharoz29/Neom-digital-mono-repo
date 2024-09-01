### App Flow

    *** top-app-mashup

        -   Checks if portal is present in sessionStorage or query string
        -   Loads portal if present
        -   Else selects the portal to load and gets the sdkComponentMap
        -   Passes the pConn$ and other props to root-container through the component-mapper

    *** root-container

        -   Expects pConn$, displayOnlyFA$ and isMashup$ as props
        -   Adds the container items to the containerAPI from pConn$
        -   Keeps local copies of pConnect
        -   Runs a switch case to render the correct view through component-mapper (app-view) in our case
        -   Passes pConn$ and displayOnlyFA$ as props

    *** app-view

        -   Expects pConn$, formGroup$ and diplayOnlyFA$ as props
        -   It is not expected that this file should be changed
        -   Sets the children to be rendered using arChildren$
        -   Checks for template name to optionally render components
        -   Then if no template conditionally renders through the displyOnlyFA$
        -   Displays all components if displayOnlyFA$ is false (our case)
        -   Renders the components through component mapper and uses pConn$ to get component Name (AppShell and View)
        -   Passes the pConn$ instance tailored seperately for each chilld

    *** app-shell

        -   Expects pConn$ as props
        -   Resolves configProps$ from pConn$
        -   Subscribes the component to angular PConnect
        -   Gets pages, caseTypes through configProps
        -   Renders Navbar (collapsed & normal) based on template
        -   Passes pConn$, appName$, homePage, pages$ and caseTypes$ to Navbar
        -   Passed pConn$, appName$, pages$, caseTypes$ to Collapsed Navbar
        -   Maps the arChildren$ and renders ViewContainer passing its tailored pConn$ as prop

    *** view-container

        -   Expects pConn$, formGroup$ and displayOnlyFA$ as props
        -   Resolves configProps$ from pConn$
        -   It is not expected that this file should be changed
        -   Renders View or children as per the template (View in our case)

    *** wide-narrow-page-component

        -   Contains mapper that maps the two sections in our app
        -   Expects pConn$ and formGroup$ as props
        -   Renders wide-narrow-form

    *** wide-narrow-form

        -   Expects pConn$ and formGroup$ as props
        -   Contains the mapper that maps the app-region (containing two regions in our app)
        -   Renders the children inside (from PConn$)

    *** app-region

        -   Expects pConn$ and formGroup$ as props
        -   Renders the children inside (from PConn$)
