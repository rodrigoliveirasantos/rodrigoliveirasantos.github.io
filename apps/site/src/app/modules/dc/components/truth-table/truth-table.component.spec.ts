import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ThuthTableComponent } from './truth-table.component';

describe('ThuthTableComponent', () => {
  let component: ThuthTableComponent;
  let fixture: ComponentFixture<ThuthTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ThuthTableComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ThuthTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
