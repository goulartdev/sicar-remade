import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SortableLayersComponent } from './sortable-layers.component';

describe('SortableLayersComponent', () => {
  let component: SortableLayersComponent;
  let fixture: ComponentFixture<SortableLayersComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SortableLayersComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SortableLayersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
