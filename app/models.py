from django.db import models

# Create your models here.
class File(models.Model):
    file_name = models.CharField(max_length=64)
    file_type = models.CharField(max_length=30, null=True)
    blob = models.BinaryField()
