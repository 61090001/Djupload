from django.shortcuts import render
from django.views.generic import TemplateView
from django.http import HttpResponse, HttpResponseRedirect, Http404
from django.urls import reverse

from . import models

LIMIT = 20

# Create your views here.
class Home(TemplateView):
    template_name = 'home.html'

    def get_context_data(self, *args, **kwargs):
        context = super(Home, self).get_context_data(*args, **kwargs)
        context['nav'] = 'home'
        return context

# List files view
class ListFiles(TemplateView):
    template_name = 'list.html'

    def get_context_data(self, *args, **kwargs):
        context = super(ListFiles, self).get_context_data(*args, **kwargs)
        context['nav'] = 'list'
        context['page'] = kwargs['page']
        lowerbound = kwargs['page'] * LIMIT - LIMIT
        upperbound = kwargs['page'] * LIMIT
        count = models.File.objects.count()
        if lowerbound > 0:
            context['prev'] = True
        if upperbound < count:
            context['next'] = True
        context['files'] = models.File.objects.all()[lowerbound:upperbound]
        return context
    
    def dispatch(self, request, *args, **kwargs):
        lowerbound = kwargs['page'] * LIMIT - LIMIT
        count = models.File.objects.count()
        if kwargs['page'] <= 0 or (count > 0 and lowerbound >= count):
            return HttpResponseRedirect(reverse('list', args=[1]))

        return super(ListFiles, self).dispatch(request, *args, **kwargs)

# Download handler
def download(request, file_id):
    try:
        my_file = models.File.objects.get(id=file_id)
    except Exception as e:
        print(e)
        raise Http404

    response = HttpResponse(my_file.blob, content_type=my_file.file_type)
    response['Content-Disposition'] = 'inline; filename="'+my_file.file_name+'"'
    return response

# Delete handler
def delete(request, file_id):
    if request.method == 'DELETE':
        try:
            my_file = models.File.objects.get(id=file_id)
            my_file.delete()
        except Exception as e:
            print(e)
            raise Http404

        return HttpResponse('Success')
    
    raise Http404

# Upload handler
def upload(request):
    # Handle POST request
    if request.method == 'POST':
        uploaded_file = request.FILES['fileToUpload'] # Retrieve file from form
        print(uploaded_file.name, uploaded_file.size, uploaded_file.content_type)
        f = models.File()
        f.file_name = uploaded_file.name
        f.file_type = uploaded_file.content_type
        f.blob = uploaded_file.read()
        f.save()
        print("Saving", f.file_name, "in database")
        return HttpResponse("Upload successfully")
    return HttpResponse("Upload failed")
