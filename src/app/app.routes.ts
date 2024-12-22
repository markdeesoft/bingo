import { Routes } from '@angular/router';
import { CardComponent } from './card/card.component';
import { GameComponent } from './game/game.component';

export const routes: Routes = [
  { 
    path: "", 
    component: GameComponent 
  },
  { 
    path: "gencard", 
    component: CardComponent 
  },
  { path: "", redirectTo: "", pathMatch: "full" },
  { path: '**', redirectTo: '' },
];
