import { Injectable } from "@angular/core";
import { HttpErrorResponse, HttpInterceptor } from "@angular/common/http";
import { HttpRequest } from "@angular/common/http";
import { Observable } from "rxjs";
import { HttpHandler } from "@angular/common/http";
import { HttpEvent } from "@angular/common/http";
import { tap } from "rxjs/operators";
import { endpoints } from "./endpoints";
import { ProgressSpinnerService } from "../_messages/progressspinner.service";
import { AuthService } from "./auth.service";

@Injectable({
  providedIn: "root",
})
export class InterceptorService implements HttpInterceptor {
  token!: string | null;
  omitCalls = [endpoints.AUTH];
  reAuthInProgress= false;

  constructor(
    private spinnerService: ProgressSpinnerService,
    private authservice: AuthService
  ) {}

  reAuthLogic = () => {
    return new Promise<void>((resolve, reject) => {
      return this.authservice
        .authRefresh()
        .then((token) => {
          if (token) {
            const authHdr = token ? `Bearer ${token}` : "";
            sessionStorage.setItem("pega_ng_user", authHdr);
            return resolve();
          }
        })
        .catch((e) => {
          console.log(e);
          reject(e);
        });
    });
  };

  intercept(
    req: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    const skipInterceptor = this.omitCalls.find((api) => req.url.includes(api));
    this.token = sessionStorage.getItem("pega_ng_user");

    if (this.token && !skipInterceptor) {
      const tokenizedReq = req.clone({
        headers: req.headers
          .set("Authorization", this.token)
      });

      return next.handle(tokenizedReq).pipe(
        tap(
          (event: any) => {
            // console.log("Event from interceptor: " + event);
          },

          (error: any) => {
            if (error instanceof HttpErrorResponse) {
              if (error.status === 401 && !this.reAuthInProgress) {
                this.reAuthInProgress = true;
                this.reAuthLogic().then(() => {
                  this.reAuthInProgress = false;
                  this.spinnerService.sendMessage(false);
                  console.log("You have been reauthenticated...pls try now");
                });
              }
            }
            return error;
          }
        )
      );
    }

    return next.handle(req);
  }
}
