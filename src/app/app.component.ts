import { Component, OnInit } from '@angular/core';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';


interface FieldGroup {
  id: number;
  name: string;
  description: string;
  fields: FormField[];
}

interface FormField {
  id: number;
  type: string;
  label: string;
  placeholder: string;
  required: boolean;
  options?: string;
  maxLength?: number;
  validation?: 'email' | 'text';
  value?: any;
  previewUrl?: string | null; // 
}

interface AvailableElement {
  type: string;
  displayName: string;
}



@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {

  fieldGroups: FieldGroup[] = [];
  selectedGroup: any;
  newGroupName = '';
  isPreviewMode: boolean = false;
  newGroupDescription = '';
  searchTerm: any;
  availableElementGroups = [
    {
      category: 'Text Fields',
      elements: [
        { type: 'Single Line Text',displayName: 'Single Line Text', icon: 'format_size' },
        { type: 'Multi Line Text', displayName: 'Multi Line Text', icon: 'segment' }
      ]
    },
    {
      category: 'Date/Time Fields',
      elements: [
        { type: 'Date', displayName: 'Date', icon: 'calendar_month' },
        { type: 'Time', displayName: 'Time', icon: 'schedule' },
        { type: 'Date & Time', displayName: 'Date & Time', icon: 'work_history' }
      ]
    },
    {
      category: 'Selection Fields',
      elements: [
        { type: 'Dropdown', displayName: 'Dropdown', icon: 'adjust' },
        { type: 'Single Selection', displayName: 'Single Selection', icon: 'check_circle' },
        { type: 'Multi Selection', displayName: 'Multi Selection', icon: 'checklist' }
      ]
    },
    {
      category: 'Media Fields',
      elements: [
        { type: 'Upload', displayName: 'Upload Field', icon: 'upload_file' }
      ]
    }
  ];

  transform(elements: any[], searchTerm: string): any[] {
    if (!searchTerm) return elements;
    return elements.filter(el =>
      el.displayName.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }

  // This is the field selected in the middle pane for property editing.
  selectedField: FormField | null = null;

  ngOnInit(): void {
    const savedGroups = localStorage.getItem('fieldGroups');
    if (savedGroups) {
      this.fieldGroups = JSON.parse(savedGroups);
      if (this.fieldGroups.length > 0) {
        // Select the first group by default
        this.selectedGroup = this.fieldGroups[0];
      }
    }
  }

  flattenAvailableElements() {
    return this.availableElementGroups.flatMap(group => group.elements);
  }

  saveGroups() {
    localStorage.setItem('fieldGroups', JSON.stringify(this.fieldGroups));
  }

  openFileds(){
    this.showFields = true;
  }
  cancelNewGroup(){
    this.showFields = false;
  }
  showFields: Boolean = false;
  addGroup() {
    this.showFields = true;
    if (this.newGroupName.trim()) {
      const newGroup: FieldGroup = {
        id: new Date().getTime(),
        name: this.newGroupName,
        description: this.newGroupDescription,
        fields: []
      };
      ;
      this.fieldGroups.push(newGroup);
      this.saveGroups();
      this.newGroupName = '';
      this.newGroupDescription = '';
      this.showFields = false;
    }
  }

  onInputChange(field: FormField) {
    if (field.maxLength && field.value?.length > field.maxLength) {
      field.value = field.value.slice(0, field.maxLength);
    }
  }
  deleteGroup(group: FieldGroup) {
    this.fieldGroups = this.fieldGroups.filter(g => g.id !== group.id);
    if (this.selectedGroup?.id === group.id) {
      this.selectedGroup = null;
      this.selectedField = null;
    }
    this.saveGroups();
  }

  selectGroup(group: FieldGroup) {
    setTimeout(() => {
      this.selectedGroup = group;
      this.selectedField = null;
      console.log("✅ Selected group:", group.name);
    });
  }

  drop(event: CdkDragDrop<any[]>) {
    console.log("📦 Drop event:", event);

    if (!this.selectedGroup) {
      console.warn("❌ No group selected — cannot drop field.");
      return;
    }

    if (event.previousContainer !== event.container) {
      const draggedElement = event.previousContainer.data[event.previousIndex] as AvailableElement;
      const newField: FormField = {
        id: new Date().getTime(),
        type: draggedElement.type,
        label: draggedElement.displayName,
        placeholder: '',
        required: false,
        maxLength: draggedElement.type === 'Single Line Text' ? 20 : undefined,
        options: draggedElement.type === 'Dropdown' ? 'Option 1, Option 2' : '',
        value: ''
      };
      this.selectedGroup.fields.splice(event.currentIndex, 0, newField);
      this.saveGroups();
    } else {
      moveItemInArray(this.selectedGroup.fields, event.previousIndex, event.currentIndex);
      this.saveGroups();
    }
  }


  // Called when a field is clicked in the canvas.
  selectField(field: FormField) {
    this.selectedField = field;
    console.log("check")
  }

  // Remove a field from the selected group.
  removeField(field: FormField) {
    if (this.selectedGroup) {
      this.selectedGroup.fields = this.selectedGroup?.fields.filter((f: any) => f.id !== field.id);
      this.saveGroups();
      if (this.selectedField?.id === field.id) {
        this.selectedField = null;
      }
    }
  }

  closeProperties() {
    this.selectedField = null;
  }

  onFileSelect(event: any, field: FormField) {
    const file = event.target.files?.[0];
    if (file) {
      field.value = file;
      console.log('📁 File selected:', file.name);
  
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = () => {
          field.previewUrl = reader.result as string;
        };
        reader.readAsDataURL(file);
      } else {
        field.previewUrl = undefined;
      }
    }
  }
  

  enforceMaxLength(field: FormField) {
    if (field.maxLength && field.value?.length > field.maxLength) {
      field.value = field.value.substring(0, field.maxLength);
    }
  }

  exportForm() {
    const data = JSON.stringify(this.fieldGroups, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
  
    const a = document.createElement('a');
    a.href = url;
    a.download = 'form-config.json';
    a.click();
  
    URL.revokeObjectURL(url);


  }
}
