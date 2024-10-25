import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CarDetailsDataComponent } from './car-details-data.component';

describe('CarDetailsDataComponent', () => {
  let component: CarDetailsDataComponent;
  let fixture: ComponentFixture<CarDetailsDataComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CarDetailsDataComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CarDetailsDataComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
