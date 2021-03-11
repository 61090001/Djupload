function fileSelected() {
    document.getElementById('progressNumber').innerHTML = '';
    var file = document.getElementById('fileToUpload').files[0];
    if (file) {
        var fileSize = 0;
        if (file.size > 1024 * 1024)
            fileSize = (Math.round(file.size * 100 / (1024 * 1024)) / 100).toString() + 'MB';
        else
            fileSize = (Math.round(file.size * 100 / 1024) / 100).toString() + 'KB';

        document.getElementById('fileName').innerHTML = 'Name: ' + file.name;
        document.getElementById('fileSize').innerHTML = 'Size: ' + fileSize;
        document.getElementById('fileType').innerHTML = 'Type: ' + file.type;
    }
}

function uploadFile() {
    const csrftoken = document.querySelector('[name=csrfmiddlewaretoken]').value;
    var fd = new FormData();
    fd.append("fileToUpload", document.getElementById('fileToUpload').files[0]);
    var xhr = new XMLHttpRequest();
    xhr.open("POST", "/upload/");
    xhr.upload.addEventListener("progress", uploadProgress, false);
    xhr.addEventListener("load", uploadComplete, false);
    xhr.addEventListener("error", uploadFailed, false);
    xhr.addEventListener("abort", uploadCanceled, false);
    xhr.setRequestHeader('X-CSRFToken', csrftoken);
    xhr.send(fd);
}

function uploadProgress(evt) {
    if (evt.lengthComputable) {
        var percentComplete = Math.round(evt.loaded * 100 / evt.total);
        document.getElementById('progressNumber').innerHTML = percentComplete.toString() + '%';
    }
    else {
        document.getElementById('progressNumber').innerHTML = 'unable to compute';
    }
}

function uploadComplete(evt) {
    /* This event is raised when the server send back a response */
    console.log(evt.target.responseText);
}

function uploadFailed(evt) {
    console.error("There was an error attempting to upload the file.");
}

function uploadCanceled(evt) {
    console.error("The upload has been canceled by the user or the browser dropped the connection.");
}

// Delete file
function deleteFile(elem, id) {
    const csrftoken = document.querySelector('[name=csrfmiddlewaretoken]').value;
    var xhr = new XMLHttpRequest();
    xhr.open("DELETE", "/delete/file/" + id);
    xhr.addEventListener("load", function(evt) {
        if (evt.target.status != 200) {
            return deleteFailed(evt);
        }
        console.log(evt.target.responseText);
        let ul = elem.parentNode.parentNode;
        let li = elem.parentNode;
        ul.removeChild(li);
    });
    xhr.addEventListener("error", deleteFailed, false);
    xhr.setRequestHeader('X-CSRFToken', csrftoken);
    xhr.send();
}

function deleteFailed(evt) {
    console.error("There was an error attempting to delete the file.");
}
