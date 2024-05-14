const video = document.getElementById('video');
const captureButton = document.getElementById('captureButton');
const openCameraButton = document.getElementById('openCameraButton');
const closeModalButtons = document.getElementsByClassName('close');
const restartButton = document.getElementById('restartButton');
const saveButton = document.getElementById('saveButton');
const logBody = document.getElementById('logBody');
const nameInput = document.getElementById('nameInput');
let currentName = ''; // To track the name for the current photo

// Get user media (access camera)
navigator.mediaDevices.getUserMedia({ video: true })
    .then(function (stream) {
        video.srcObject = stream;
    })
    .catch(function (err) {
        console.error('Error accessing camera: ', err);
    });

// Show the camera modal
openCameraButton.addEventListener('click', function () {
    currentName = nameInput.value.trim();
    if (!currentName) {
        alert("Please enter your name first.");
        return;
    }

    const modal = document.getElementById('cameraModal');
    modal.style.display = 'block';
});

// Close the camera modal when clicking on the close button or outside the modal
Array.from(closeModalButtons).forEach(function (button) {
    button.addEventListener('click', function () {
        const modal = document.getElementById('cameraModal');
        modal.style.display = 'none';
    });
});

window.onclick = function (event) {
    const modal = document.getElementById('cameraModal');
    if (event.target == modal) {
        modal.style.display = 'none';
    }
}

// Capture selfie with name, time, date and add to attendance log table
captureButton.addEventListener('click', function () {
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    const imgUrl = canvas.toDataURL('image/jpeg');

    const now = new Date();
    const timeString = now.toLocaleTimeString();
    const dateString = now.toLocaleDateString();

    const newRow = logBody.insertRow();
    const nameCell = newRow.insertCell();
    const timeCell = newRow.insertCell();
    const dateCell = newRow.insertCell();
    const imgCell = newRow.insertCell();
    const presentCell = newRow.insertCell();
    const img = document.createElement('img');
    img.src = imgUrl;
    img.width = 100; // Set image width
    nameCell.textContent = currentName;
    timeCell.textContent = timeString;
    dateCell.textContent = dateString;
    imgCell.appendChild(img);
    const presentCheckbox = document.createElement('input');
    presentCheckbox.type = 'checkbox';
    presentCell.appendChild(presentCheckbox);

    // Close the camera modal after capturing the photo
    const modal = document.getElementById('cameraModal');
    modal.style.display = 'none';
});

// Restart button functionality
restartButton.addEventListener('click', function () {
    logBody.innerHTML = ''; // Clear attendance log
});

// Save button functionality
saveButton.addEventListener('click', function () {
    const { jsPDF } = window.jspdf;

    const doc = new jsPDF();
    let yPosition = 20; // Initial vertical position in the PDF

    doc.setFontSize(18);
    doc.text('Attendance Log', 14, yPosition);
    yPosition += 10;

    const rows = Array.from(logBody.rows);

    rows.forEach((row, index) => {
        const cells = Array.from(row.cells);
        const name = cells[0].textContent;
        const time = cells[1].textContent;
        const date = cells[2].textContent;
        const img = cells[3].querySelector('img').src;
        const present = cells[4].querySelector('input').checked ? 'Yes' : 'No';

        // Adding text
        doc.setFontSize(12);
        doc.text(`Name: ${name}`, 14, yPosition);
        doc.text(`Time: ${time}`, 14, yPosition + 5);
        doc.text(`Date: ${date}`, 14, yPosition + 10);
        doc.text(`Present: ${present}`, 14, yPosition + 15);

        // Adding image
        doc.addImage(img, 'JPEG', 60, yPosition - 10, 30, 30);
        yPosition += 40; // Move to next position

        if ((index + 1) % 5 === 0) { // If 5 records fit on one page, add a new page
            doc.addPage();
            yPosition = 20;
        }
    });

    doc.save('attendance_log.pdf');
});

