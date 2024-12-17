import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CARDetailsComponent } from './car-details.component';

describe('CARDetailsComponent', () => {
  let component: CARDetailsComponent;
  let fixture: ComponentFixture<CARDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CARDetailsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CARDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
