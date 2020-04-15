import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { RedirectPage } from './redirect.page';

describe('RedirectPage', () => {
  let component: RedirectPage;
  let fixture: ComponentFixture<RedirectPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RedirectPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(RedirectPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
