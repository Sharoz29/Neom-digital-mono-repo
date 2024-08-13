import { Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { MatSort } from '@angular/material/sort';
import { DatapageService } from '../_services/datapage.service';
import { Subscription, Observable } from 'rxjs';
import { HttpParams, HttpHeaders } from '@angular/common/http';
import { OpenAssignmentService } from '../_messages/openassignment.service';
import { RefreshWorkListService } from '../_messages/refreshworklist.service';
import { ProgressSpinnerService } from '../_messages/progressspinner.service';
import { GetLoginStatusService } from '../_messages/getloginstatus.service';
import { endpoints } from '../_services/endpoints';

@Component({
  selector: 'app-worklist',
  templateUrl: './worklist.component.html',
  styleUrls: ['./worklist.component.scss'],
})
export class WorklistComponent implements OnInit {
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  worklist$!: MatTableDataSource<any>;
  works$!: Object;
  headers: any;

  message: any;
  subscription!: Subscription;

  displayedColumns = [
    'pxRefObjectInsName',
    'pyAssignmentStatus',
    'pyLabel',
    'pxUrgencyAssign',
  ];
  worklistResults: any[] = [];

  constructor(
    private datapage: DatapageService,
    private oaservice: OpenAssignmentService,
    private rwlservice: RefreshWorkListService,
    private psservice: ProgressSpinnerService,
    private glsservice: GetLoginStatusService
  ) {}

  ngOnInit() {
    this.getWorkList();

    // will get operatorID datapage in case of OAuth, for basic auth it is done in the login method itself
    if (endpoints.use_OAuth) {
      this.loadFromOAuth();
    }

    this.subscription = this.rwlservice.getMessage().subscribe((message) => {
      this.message = message;

      if (
        this.message.workList === 'Work' ||
        this.message.workList === 'Worklist'
      ) {
        this.getWorkList();
      } else {
        this.getWorkBaskets(this.message.workList);
      }
    });
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  loadFromOAuth() {
    this.psservice.sendMessage(true);

    const operatorParams = new HttpParams();

    this.datapage.getDataPage('D_OperatorID', operatorParams).subscribe(
      (response: any) => {
        const operator: any = response.pyUserName;
        sessionStorage.setItem('userName', operator);
        sessionStorage.setItem(
          'userWorkBaskets',
          JSON.stringify(response.pyWorkBasketList)
        );

        this.psservice.sendMessage(false);
        this.glsservice.sendMessage('LoggedIn');
      },
      (err) => {
        this.psservice.sendMessage(false);
        console.log('Errors getting data page: ' + err.message);
      }
    );
  }

  getWorkList() {
    const worklistParams = new HttpParams().set('Work', 'true');

    this.psservice.sendMessage(true);

    const dsubscription = this.datapage
      .getDataPage('D_Worklist', worklistParams)
      .subscribe(
        (response: any) => {
          this.worklist$ = new MatTableDataSource<any>(
            this.getResults(response)
          );
          this.headers = response.headers;

          this.worklist$.paginator = this.paginator;
          this.worklist$.sort = this.sort;

          this.psservice.sendMessage(false);

          dsubscription.unsubscribe();
        },
        (err) => {
          this.psservice.sendMessage(false);
          console.log('Error form worklist:' + err.errors);
        }
      );
  }

  getWorkBaskets(workbasket: string | number | boolean) {
    const workbasketParams = new HttpParams().set('WorkBasket', workbasket);

    const dsubscription = this.datapage
      .getDataPage('D_WorkBasket', workbasketParams)
      .subscribe(
        (response: any) => {
          this.worklist$ = new MatTableDataSource<any>(
            this.getResults(response)
          );
          this.headers = response.headers;

          this.worklist$.paginator = this.paginator;

          dsubscription.unsubscribe();
        },
        (err) => {
          console.log('Error form workbasket:' + err.errors);
        }
      );
  }

  getResults(data: { pxResults: never[] }) {
    this.worklistResults = data.pxResults;
    return data.pxResults;
  }

  filterWorklistbyCaseId(value: string) {
    const filteredList = this.worklistResults.filter((element) =>
      element.pxRefObjectInsName?.toLowerCase().includes(value?.toLowerCase())
    );
    this.worklist$.data = filteredList;
  }

  openAssignment(row: any) {
    this.psservice.sendMessage(true);
    this.oaservice.sendMessage(row.pxRefObjectInsName, row);
  }
}
