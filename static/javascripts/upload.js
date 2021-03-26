const filename_max_length = 64;
const max_size = 26214400;

document.addEventListener('DOMContentLoaded', function(event) {
    var filename = document.getElementById('filename');
    var formFile = document.getElementById('formFile');
    var btnUpload = document.getElementById('upload-btn');
    filename.onblur = onFilenameBlur;
    formFile.onchange = onFileSelect;
    btnUpload.onclick = uploadFile;
});

function calculateFileSize(file) {
    if (file.size > 1048576) {
        return (Math.round(file.size * 100 / (1024 * 1024)) / 100).toString() + 'MB';
    } else {
        return (Math.round(file.size * 100 / 1024) / 100).toString() + 'KB';
    }
}

function onFileSelect(event) {
    var filename = document.getElementById('filename');
    var filedetailtype = document.getElementById('filedetailtype');
    var filedetailsize = document.getElementById('filedetailsize');
    var progressBar = document.getElementById('progressbar');
    var toggleProgressBar = document.getElementById('toggle-progress-bar');
    var toggleSecretLink = document.getElementById('toggle-secret-link');
    var btnUpload = document.getElementById('upload-btn');

    if (event.target.files[0].name.length > filename_max_length) {
        filename.value = event.target.files[0].name.slice(0,filename_max_length);
    } else {
        filename.value = event.target.files[0].name;
    }
    filename.removeAttribute('disabled');

    const filetype = event.target.files[0].type;
    const filesize = event.target.files[0].size;
    const filesizestr = calculateFileSize(event.target.files[0]);
    filedetailtype.innerHTML = 'File type: ' + filetype;
    filedetailsize.innerHTML = 'File size: ' + filesizestr;

    toggleProgressBar.classList.add('d-none');
    progressBar.style.width = '0%';
    progressBar.setAttribute('aria-valuenow', '0');
    progressBar.innerHTML = '0%';

    toggleSecretLink.classList.add('d-none');

    if (filesize > max_size) {
        filedetailsize.classList.remove('text-success');
        filedetailsize.classList.add('text-danger');
        btnUpload.setAttribute('disabled', 'disabled');
        return;
    }

    filedetailsize.classList.remove('text-danger');
    filedetailsize.classList.add('text-success');
    btnUpload.removeAttribute('disabled');
}

function onFilenameBlur(event) {
    if (!(event.target.value) || event.target.value.trim() == '') {
        var formFile = document.getElementById('formFile');
        if (formFile.files.length > 0) {
            event.target.value = formFile.files[0].name;
        }
        return;
    }
}

function uploadFile(event) {
    event.preventDefault();
    var filename = document.getElementById('filename');
    var formFile = document.getElementById('formFile');
    if (filename.value.trim() == "" || filename.value.length > filename_max_length || formFile.files.length == 0 || formFile.files[0].size > max_size) {
        return;
    }
    var toggleProgressBar = document.getElementById('toggle-progress-bar');
    toggleProgressBar.classList.remove('d-none');
    getUploadUrl(filename.value, formFile.files[0]);
}

function getUploadUrl(filename, file) {
    const csrftoken = document.querySelector('[name=csrfmiddlewaretoken]').value;
    var xhr = new XMLHttpRequest();
    xhr.open('POST', '/genuploadurl');
    xhr.setRequestHeader('X-CSRFToken', csrftoken);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.addEventListener('load', function(evt) {upload(evt.target.responseText,filename,file);}, false);
    xhr.addEventListener('error', function(evt) {console.error("There was an error attempting to generate url.");}, false);
    xhr.send(JSON.stringify({'filename':filename}));
}

function getReadUrl(filename) {
    const csrftoken = document.querySelector('[name=csrfmiddlewaretoken]').value;
    var xhr = new XMLHttpRequest();
    xhr.open('POST', '/genreadurl');
    xhr.setRequestHeader('X-CSRFToken', csrftoken);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.addEventListener('load', function(evt) {
        var toggleSecretLink = document.getElementById('toggle-secret-link');
        var secretLink = document.getElementById('secret-link');
        secretLink.href = evt.target.responseText;
        secretLink.innerHTML = evt.target.responseText;
        toggleSecretLink.classList.remove('d-none');
    }, false);
    xhr.addEventListener('error', function(evt) {console.error("There was an error attempting to generate url.");}, false);
    xhr.send(JSON.stringify({'filename':filename}));
}

function upload(signedurl, filename, file) {
    var xhr = new XMLHttpRequest();
    xhr.open("PUT", signedurl);
    xhr.setRequestHeader('x-amz-acl', 'private');
    xhr.setRequestHeader('Content-Type', file.type);
    xhr.upload.addEventListener("progress", uploadProgress, false);
    xhr.addEventListener("load", function(evt) {
        console.log('Upload file successfully');
        getReadUrl(filename);
    }, false);
    xhr.addEventListener("error", uploadFailed, false);
    xhr.addEventListener("abort", uploadCanceled, false);
    xhr.send(file);
}

function uploadProgress(evt) {
    if (evt.lengthComputable) {
        var percentComplete = Math.round(evt.loaded * 100 / evt.total).toString();
        var progressBar = document.getElementById('progressbar');
        progressBar.style.width = percentComplete + '%';
        progressBar.setAttribute('aria-valuenow', percentComplete);
        progressBar.innerHTML = percentComplete + '%';
    }
}

function uploadFailed(evt) {
    console.error("There was an error attempting to upload the file.");
}

function uploadCanceled(evt) {
    console.error("The upload has been canceled by the user or the browser dropped the connection.");
}
