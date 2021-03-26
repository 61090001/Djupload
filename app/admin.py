from django import forms
from django.contrib import admin
from django.contrib.auth.models import Group
from django.utils.safestring import mark_safe

from .models import File
from . import s3

admin.site.site_header = 'List of Files'

class FileForm(forms.ModelForm):
    generated_link = forms.CharField()

    def __init__(self, *args, **kwargs):
        super(FileForm, self).__init__(*args, **kwargs)
        url = s3.gensignedreadurl(self.instance.file_key)
        self.fields['generated_link'].widget.attrs['readonly'] = True
        self.fields['generated_link'].initial = 'Click on the generated link label'
        self.fields['generated_link'].label = mark_safe(f'<a href="{url}" rel="noopener noreferer" target="_blank">Generated link</a>')

    class Meta:
        model = File
        fields = '__all__'

class FilesAdmin(admin.ModelAdmin):
    list_display = ('file_name', 'file_key', 'created_at')
    form = FileForm

# Register your models here.
admin.site.register(File, FilesAdmin)
