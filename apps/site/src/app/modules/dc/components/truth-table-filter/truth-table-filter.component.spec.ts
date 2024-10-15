import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TruthTableFilterComponent } from './truth-table-filter.component';

describe('TruthTableFilterComponent', () => {
  let component: TruthTableFilterComponent;
  let fixture: ComponentFixture<TruthTableFilterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TruthTableFilterComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(TruthTableFilterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
