import { Component, OnInit, Input, ChangeDetectorRef, NgZone, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatMenuModule } from '@angular/material/menu';
import { MatListModule } from '@angular/material/list';
import { logout } from '@pega/auth/lib/sdk-auth-manager';
import { AngularPConnectData, AngularPConnectService } from '../../../_bridge/angular-pconnect';
import { ProgressSpinnerService } from '../../../_messages/progress-spinner.service';
import { Utils } from '../../../_helpers/utils';

declare const window: any;

interface NavBarProps {
  // If any, enter additional props that only exist on this component
  showAppName?: boolean;
}

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss'],
  providers: [Utils],
  standalone: true,
  imports: [CommonModule, MatListModule, MatMenuModule]
})
export class NavbarComponent implements OnInit, OnDestroy {
  @Input() pConn$: typeof PConnect;
  @Input() appName$: string;
  @Input() pages$: any[];
  @Input() caseTypes$: any[];

  // For interaction with AngularPConnect
  angularPConnectData: AngularPConnectData = {};
  configProps$: NavBarProps;

  navPages$: any[];
  navExpandCollapse$: string;
  bShowCaseTypes$ = false;

  portalApp$ = '';
  portalLogoImage$: string;
  showAppName$?: boolean = false;

  portalOperator$: string;
  portalOperatorInitials$: string;

  actionsAPI: any;
  createWork: any;
  showPage: any;
  logout: any;

  navIcon$: string;
  localizedVal: any;
  localeCategory = 'AppShell';
  localeUtils = PCore.getLocaleUtils();
  localeReference: any;
  constructor(
    private angularPConnect: AngularPConnectService,
    private chRef: ChangeDetectorRef,
    private psService: ProgressSpinnerService,
    private ngZone: NgZone,
    private utils: Utils
  ) {}

  ngOnInit(): void {
    // First thing in initialization is registering and subscribing to the AngularPConnect service
    this.angularPConnectData = this.angularPConnect.registerAndSubscribeComponent(this, this.onStateChange);

    this.navIcon$ = this.utils.getSDKStaticContentUrl().concat('assets/LowCodeSolutionsLogo.jpg');

    // this is a dummy "get", because right now images are in http and the main screen is https
    // so the images don't load automatically.  This call, makes an initial hit that allows the
    // rest of the images to show up
    this.loadImage(this.navIcon$);

    this.initComponent();
    this.localizedVal = PCore.getLocaleUtils().getLocaleValue;
  }

  // ngOnDestroy
  //  unsubscribe from Store
  ngOnDestroy(): void {
    if (this.angularPConnectData.unsubscribeFn) {
      this.angularPConnectData.unsubscribeFn();
    }
  }

  loadImage(src: string) {
    return new Promise(resolve => {
      resolve(src);
    });
  }

  // Callback passed when subscribing to store change
  onStateChange() {
    // Should always check the bridge to see if the component should update itself (re-render)
    const bUpdateSelf = this.angularPConnect.shouldComponentUpdate(this);

    // NOTE: can call angularPConnect.getState with optional args for detailed logging: bLogMsg and component object
    this.angularPConnect.getState();

    if (bUpdateSelf) {
      this.updateSelf();
    }
  }

  updateSelf(): void {
    this.initComponent();
  }

  initComponent() {
    this.ngZone.run(() => {
      this.navIcon$ = this.utils.getSDKStaticContentUrl().concat('assets/LowCodeSolutionsLogo.jpg');
      this.navExpandCollapse$ = this.utils.getImageSrc('plus', this.utils.getSDKStaticContentUrl());

      // Then, continue on with other initialization

      // making a copy, so can add info
      this.navPages$ = JSON.parse(JSON.stringify(this.pages$));

      this.navPages$.forEach(page => {
        page.iconName = this.utils.getImageSrc(page.pxPageViewIcon, this.utils.getSDKStaticContentUrl());
      });
      this.localeReference = this.pConn$.getValue('.pyLocaleReference');
      this.actionsAPI = this.pConn$.getActionsApi();
      this.createWork = this.actionsAPI.createWork.bind(this.actionsAPI);
      this.showPage = this.actionsAPI.showPage.bind(this.actionsAPI);
      this.configProps$ = this.pConn$.resolveConfigProps(this.pConn$.getConfigProps()) as NavBarProps;
      this.logout = this.actionsAPI.logout.bind(this.actionsAPI);

      // const oData = this.pConn$.getDataObject();

      this.portalLogoImage$ = this.utils.getSDKStaticContentUrl().concat('assets/LowCodeSolutionsLogo.jpg');
      this.portalOperator$ = PCore.getEnvironmentInfo().getOperatorName();
      this.portalOperatorInitials$ = this.utils.getInitials(this.portalOperator$);
      this.showAppName$ = this.configProps$.showAppName;

      this.portalApp$ = PCore.getEnvironmentInfo().getApplicationLabel();
    });
  }

  navPanelButtonClick(oPageData: any) {
    const { pyClassName, pyRuleName } = oPageData;

    this.showPage(pyRuleName, pyClassName);
  }

  navPanelCreateButtonClick() {
    if (this.navExpandCollapse$.indexOf('plus') > 0) {
      this.navExpandCollapse$ = this.utils.getImageSrc('times', this.utils.getSDKStaticContentUrl());
      this.bShowCaseTypes$ = true;
    } else {
      this.navExpandCollapse$ = this.utils.getImageSrc('plus', this.utils.getSDKStaticContentUrl());
      this.bShowCaseTypes$ = false;
    }

    this.chRef.detectChanges();
  }

  navPanelCreateCaseType(sCaseType: string, sFlowType: string) {
    this.psService.sendMessage(true);
    this.navPanelCreateButtonClick();

    const actionInfo = {
      containerName: 'primary',
      flowType: sFlowType || 'pyStartCase'
    };
    this.createWork(sCaseType, actionInfo).then(() => {
      console.log('createWork completed');
    });
  }

  navPanelLogoutClick() {
    logout().then(() => {
      // Reload the page to kick off the login
      window.location.reload();
    });
  }
}
