import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { KeycloakEventType, KeycloakService } from 'keycloak-angular';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {

  subs = new Subscription();

  constructor(
    private http: HttpClient,
    private keycloak: KeycloakService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.fetch();

    this.subs.add(
      this.keycloak.keycloakEvents$.subscribe((event) => {
        if (event.type === KeycloakEventType.OnTokenExpired) {
          this.keycloak.updateToken(20)
            .then(() => {
              this.fetch();
            })
            .catch(console.error);
        }
      })
    )
  }

  logout() {
    this.keycloak.logout('http://localhost:4200/unauth')
      .catch(console.error);
  }

  fetch() {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.keycloak.getKeycloakInstance().token || ''}`
    });

    // this.http.get('http://localhost:3000/api/hello')
    this.http.get('http://localhost:3002/api/diagnostic', {
      headers
    }).subscribe({ next: console.log, error: console.error });
  }
}
