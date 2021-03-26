from django.shortcuts import render
from django.views.generic import TemplateView
from django.http import HttpResponse, HttpResponseRedirect, Http404
from django.urls import reverse
import json

from .models import File
from . import s3

# Create your views here.
class Home(TemplateView):
    template_name = 'home.html'

    def get_context_data(self, *args, **kwargs):
        context = super(Home, self).get_context_data(*args, **kwargs)
        context['nav'] = 'home'
        return context

# Generate a signed url for uploading file
def gensigneduploadurl(request):
    if not request.user.is_authenticated:
        return HttpResponse('Unauthorized', status=401)
    if request.method != "POST":
        return Http404()
    body = request.body.decode('utf-8')
    data = json.loads(body)
    filename = data['filename']
    key = f'files/{request.user.get_username()}/{filename}'
    url = s3.gensigneduploadurl(key)
    f = File()
    f.file_name = filename
    f.file_key = key
    f.save()
    return HttpResponse(url)

# Generate a signed url for reading file
def gensignedreadurl(request):
    if not request.user.is_authenticated:
        return HttpResponse('Unauthorized', status=401)
    if request.method != "POST":
        return Http404()
    body = request.body.decode('utf-8')
    data = json.loads(body)
    filename = data['filename']
    key = f'files/{request.user.get_username()}/{filename}'
    url = s3.gensignedreadurl(key)
    return HttpResponse(url)
