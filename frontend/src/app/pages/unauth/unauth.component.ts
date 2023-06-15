import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { KeycloakService } from 'keycloak-angular';
import { concatMap } from 'rxjs';

@Component({
  selector: 'app-unauth',
  templateUrl: './unauth.component.html',
  styleUrls: ['./unauth.component.scss']
})
export class UnauthComponent implements OnInit {

  constructor(
    private keycloak: KeycloakService,
    private http: HttpClient
  ) { }

  ngOnInit(): void {
    this.http.get('http://localhost:3000/api/hello')
      .pipe(concatMap(() => this.http.get('http://localhost:3000/api/hello')))
      .subscribe({ next: console.log, error: console.error });
  }

  login() {
    this.keycloak.login({
      redirectUri: 'http://localhost:4200/home'
    })
      .catch(console.error);
  }
}
