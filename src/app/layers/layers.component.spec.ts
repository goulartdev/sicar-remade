import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LayersComponent } from './layers.component';

describe('LayersComponent', () => {
  let component: LayersComponent;
  let fixture: ComponentFixture<LayersComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LayersComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LayersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
