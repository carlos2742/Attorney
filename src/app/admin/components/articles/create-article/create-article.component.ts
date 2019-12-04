import { Component, OnInit } from '@angular/core';
import {FormBuilder, FormControl, Validators} from '@angular/forms';
import {IDropdownSettings} from 'ng-multiselect-dropdown/multiselect.model';
import {PracticeAreaService} from '../../../services/practice_area/practice-area.service';
import {TagService} from '../../../services/tag/tag.service';
import {ArticleService} from '../../../services/article/article.service';
import {Router} from '@angular/router';

@Component({
  selector: 'app-create-article',
  templateUrl: './create-article.component.html',
  styleUrls: ['./create-article.component.scss']
})
export class CreateArticleComponent implements OnInit {

  public form;
  public language: string;

  dropdownSettings = {};

  public practiceAreas;
  public tags;
  public sending: boolean;

  constructor(private router: Router, private formBuilder: FormBuilder, private articleService: ArticleService,
              private pareas: PracticeAreaService, private tag: TagService) {
    this.form = this.formBuilder.group({
      practice_area_id: new FormControl('1', [Validators.required]),
      tags: new FormControl('', [Validators.required]),
      image_id: new FormControl('' ),
      esTitle: new FormControl('', [Validators.required]),
      esContent: new FormControl('', [Validators.required]),
      enTitle: new FormControl(''),
      enContent: new FormControl(''),
    });
    this.pareas.all.subscribe(response => {
     this.practiceAreas = (response as Array<any>).map(item =>{
        return{id:item.id, value: `${item.languages['es']} - (${item.languages['en']})`}
      });
    });
    this.tag.all.subscribe(response => {
      this.tags = (response as Array<any>).map(item =>{
        return{id:item.id, value: `${item.languages['es']} - (${item.languages['en']})`}
      });
    });
    this.language = 'es';
    this.dropdownSettings = {
      singleSelection: false,
      idField: 'id',
      textField: 'value',
      selectAllText: 'Seleccionar Todas',
      unSelectAllText: 'Deseleccionar Todas',
      allowSearchFilter: true,
      searchPlaceholderText: 'Buscar'
    };
    this.sending = false;
  }

  ngOnInit() {}

  editorOptions(){
    return {
      language: 'es',
      heightMin: 300,
      placeholderText: `Contenido del artículo.`
    }
  }

  create(){
    if (this.form.invalid) {
      Object.keys(this.form.controls).every(
        field => {
          const control = this.form.get(field);
          if(control.status === 'INVALID'){
            control.markAsTouched({ onlySelf: true });
            return false;
          }
          return true;
        });
      return;
    }
    this.sending = true;
    const formValue = this.form.value;
    const payload = {
      article: {
        practice_area_id: formValue.practice_area_id,
        image_id: formValue.image_id
      },
      translation: {
        fields: [
          {
            lang: 'es',
            title: formValue.esTitle,
            content: this.removeFroalaTag(formValue.esContent)
          },
          {
            lang: 'en',
            title: formValue.enTitle !== '' ? formValue.enTitle : formValue.esTitle,
            content: formValue.enContent !== '' ? this.removeFroalaTag(formValue.enContent) : this.removeFroalaTag(formValue.esContent)
          }
        ]
      },
      tag: {
        values: formValue.tags.map(item => item.id)
      }
    };
    this.articleService.create(payload).subscribe(
      response => {
        console.log(response);
        this.sending = false;
        this.router.navigate(['/admin/article-view/:id',{id:response['id']}]);
      },
      error=>{console.log(error)}
    );
  }

  changeLanguage(lang){
    this.language = lang;
  }

  private removeFroalaTag(text){
    let htmlText = text;
    const index  = text.indexOf('<p data-f-id="pbf"');
    const sub = htmlText.slice(index);
    htmlText = htmlText.replace(sub,'');
    return htmlText;
  }

}
