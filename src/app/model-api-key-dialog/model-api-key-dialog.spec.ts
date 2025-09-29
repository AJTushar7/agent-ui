import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModelApiKeyDialog } from './model-api-key-dialog';

describe('ModelApiKeyDialog', () => {
  let component: ModelApiKeyDialog;
  let fixture: ComponentFixture<ModelApiKeyDialog>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ModelApiKeyDialog]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ModelApiKeyDialog);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
