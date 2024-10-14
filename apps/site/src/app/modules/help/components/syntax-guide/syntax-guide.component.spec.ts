import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SyntaxGuideComponent } from './syntax-guide.component';

describe('SyntaxGuideComponent', () => {
  let component: SyntaxGuideComponent;
  let fixture: ComponentFixture<SyntaxGuideComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SyntaxGuideComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(SyntaxGuideComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
