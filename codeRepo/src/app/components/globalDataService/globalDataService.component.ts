import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { UserInfo } from '../../DataContracts/Auth/userInfo';


interface ShareObj {
  [id: string]: any;
}

//@Component({
//  selector: 'global-data-service',
//})

@Injectable()
export class GlobalDataService {

  constructor(private _http: HttpClient) {

  }
  Authenticating: boolean = true;
  Authenticated: boolean = false;
  AuthenticationError: string = "";
  // user data
  userInfo: UserInfo = new UserInfo();

  public processAvailableBanners() {
    let ui: any = this.userInfo;
    let banners: string[] = [];
    if (ui.Banners) {
      for (let i = 0; i < ui.Banners.length; i++) {
        banners.push(ui.Banners[i].BannerName);
      }
    }
    this.userConfiguration.userAvailableBanners = banners;
  }

  public userConfiguration = new class {
    // the active year for the user on this session, default current
    activePlanningYear = { value: new Date().getFullYear(), text: new Date().getFullYear().toString() };

    // available Planning Years for the user 
    userAvailableYears: any[] = [];

    userAvailableBanners: string[] = [];
    userAvailableCustomers: string[] = [];
  }

  public adminConfiguration = new class {
    // available Planning Years for the admin
    adminAvailableYears: any[] = [{ value: 2018, text: "2018" }, { value: 2019, text: "2019" }, { value: 2019, text: "2020" }, { value: 2019, text: "2021" }, { value: 2019, text: "2022" }, { value: 2019, text: "2023" }];
  }

  public configuration = new class {
    // Application's configuration
    environment: string = "";
  }

  private handleError(error: any) {
  }

  load() {
    return new Promise((resolve, reject) => {
      let headers = new HttpHeaders();

      headers = headers.append('X-Requested-With', 'XMLHttpRequest');
      this._http.get<UserInfo>('api/Auth/UserInfo', { headers: headers }).toPromise<UserInfo>()
        .then(_userInfo => {
          this.userInfo = _userInfo

          if (this.userInfo.Authenticated) {
            //Redirect the user to Funding if the user is from Financial
            if (this.userInfo.IsFinanceUser) {
              window.location.href = '/funds/auth/startsso';
              return;
            }
            this.Authenticated = this.userInfo.Authenticated;
            this.configuration.environment = _userInfo['Environment'];

            this.processAvailableBanners();
            this.userConfiguration.userAvailableCustomers = this.userInfo.Customers;
            for (let i = 0; i < this.userInfo.Years.length; i++) {
              this.userConfiguration.userAvailableYears.push({ value: this.userInfo.Years[i], text: this.userInfo.Years[i].toString() });
            }
          }
          else {
            this.userInfo.SalesOrg = [];
            this.Authenticated = this.userInfo.Authenticated;
            this.AuthenticationError = this.userInfo.Error;
          }
          this.Authenticating = false;
          resolve(true);
        }).catch(reason => {
          if (reason.status == 401) {
            window.location.href = '/auth/startsso';
          }

          this.handleError(reason);
          reject(reason)
        }
        );
    })
  }
}
