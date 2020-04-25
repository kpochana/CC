import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule, PopoverController } from '@ionic/angular';

import { PostPageRoutingModule } from './post-routing.module';

import { PostPage } from './post.page';
import { PopoverMenuComponent } from 'src/app/components/popover-menu/popover-menu.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    PostPageRoutingModule
  ],
  entryComponents: [PopoverMenuComponent],
  declarations: [PostPage, PopoverMenuComponent]
})
export class PostPageModule {}
