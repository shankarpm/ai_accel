import { Component, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ApplicationSecurityRoles } from '../../data-contracts/application-security-roles/application-security-roles';
import { CommonModule } from '@angular/common';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

//interface ShareObj {
//  [id: string]: any;
//}

@Component({
  selector: 'app-application-security-roles',
  templateUrl: './application-security-roles.component.html',
  imports: [CommonModule],
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})

@Injectable()
export class ApplicationSecurityRolesComponent {

  constructor(private _http: HttpClient) {
  }

  public applicationSecurityRoles: ApplicationSecurityRoles = new ApplicationSecurityRoles();

  public isSuperUser() {
    return this.applicationSecurityRoles.Superuser;
  }
  public isAdmin() {
    return this.applicationSecurityRoles.Admin;
  }
  public isCIM() {
    return this.applicationSecurityRoles.CIM;
  }
  public isCCM() {
    return this.applicationSecurityRoles.CCM;
  }
  public isLeadership() {
    return this.applicationSecurityRoles.Leadership;
  }
  public isCVP() {
    return this.applicationSecurityRoles.CVP;
  }
  public isDCD() {
    return this.applicationSecurityRoles.DCD;
  }
}