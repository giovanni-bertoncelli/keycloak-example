import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { KeycloakEventType, KeycloakService } from 'keycloak-angular';
import { Subscription, concatMap } from 'rxjs';

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
    this.http.get('http://localhost:3000/api/hello')
      .pipe(concatMap(() => this.http.get('http://localhost:3000/api/hello')))
      .subscribe({ next: console.log, error: console.error });

    this.subs.add(
      this.keycloak.keycloakEvents$.subscribe((event) => {
        if (event.type === KeycloakEventType.OnTokenExpired) {
          this.keycloak.updateToken(20)
            .then(() => {
              this.http.get('http://localhost:3000/api/hello')
                .subscribe({ next: console.log, error: console.error });
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

}
