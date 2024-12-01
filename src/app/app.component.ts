import { Component, ElementRef, ViewChild } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { catchError, debounce, debounceTime, filter, fromEvent, map, switchMap, tap } from 'rxjs';
import {ajax, AjaxResponse} from 'rxjs/ajax'

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  @ViewChild('searchInput', { static: true }) searchInput?: ElementRef<HTMLInputElement>;
  users: any[] = [];

  ngOnInit(): void {
    const searchObservable = fromEvent<Event>(this.searchInput!.nativeElement, 'input').pipe(
      debounceTime(1000),
      filter((event: Event) => {
        const inputElement = event.target as HTMLInputElement;
        return inputElement.value.trim() !== '';
      }),
      switchMap((event: Event) => {
        const inputElement = event.target as HTMLInputElement;
        return ajax(`https://api.github.com/search/users?q=${inputElement.value}`).pipe(
          catchError(error => {
            console.error('Error fetching users:', error);
            return [];
          })
        );
      }),
      map((response:any) => response.response.items),
      tap(users => console.log('Fetched users:', users))
    );

    searchObservable.subscribe(
      (users: any) => {
        this.users = users;
      },
      (error: any) => console.error('Error in subscription:', error),
      () => console.log('Search complete')
    );
  }
}

