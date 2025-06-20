
//for the dog image to load
document.addEventListener('DOMContentLoaded', function () {
    const form = document.getElementById('multistep');
    const img = document.getElementById('goodboy');

    form.addEventListener('submit', function (e) {
        e.preventDefault();

        const step1 = document.getElementById('step1').checked;
        const step2 = document.getElementById('step2').checked;
        const step3 = document.getElementById('step3').checked;


        //ensures boxes are ticked before button
        if (step1 && step2 && step3) {
            fetch('https://dog.ceo/api/breeds/image/random')
                .then(response => response.json())
                .then(data => {
                    img.src = data.message;
                    img.style.display = 'block';
                    img.classList.add('spin');

                    //disables button after successful fetch
                    form.querySelector('button[type="submit"]').disabled = true;
                })
                .catch(error => console.error('Failed to fetch dog image:', error));
        } else {
            alert("Please complete all steps before fetching the good boy!");
        }
    });

    //random background colour
    const colors = ['#ffcccb', '#d0f0c0', '#add8e6', '#fffacd', '#e0bbff'];
    let index = 0;
    setInterval(() => {
        document.body.style.backgroundColor = colors[index];
        index = (index + 1) % colors.length;
    }, 300); //change is every 0.3 seconds party
});