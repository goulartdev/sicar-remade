import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CARDetailsDataComponent } from './car-details-data.component';

describe('CARDetailsDataComponent', () => {
  let component: CARDetailsDataComponent;
  let fixture: ComponentFixture<CARDetailsDataComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CARDetailsDataComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CARDetailsDataComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
