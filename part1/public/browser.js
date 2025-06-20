

document.addEventListener('DOMContentLoaded', function () {
    const img = document.getElementById('goodboy');

    fetch('https://dog.ceo/api/breeds/image/random')
        .then(response => response.json())
        .then(data => {
            img.src = data.message;
            img.style.display = 'block';
        })
        .catch(error => console.error('Failed to fetch dog image:', error));
});