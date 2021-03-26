from django.db import models

# Create your models here.
class File(models.Model):
    file_name = models.CharField(max_length=64)
    file_key = models.CharField(max_length=128, default='files')
    created_at = models.DateTimeField(auto_now=True)
