// @ts-nocheck
function parseDate(dateString) {
    const datePattern = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2}).*Z$/;
    const p = datePattern.exec(dateString);
    if (p === null) {
        return undefined;
    }
    return `${p[1]}-${p[2]}-${p[3]}T${p[4]}:${p[5]}:${p[6]}Z`;
}

// left-pad by one '0'
const lp = (v) => ((v + '').length == 1 ? '0' : '') + v;

function parseDateForInput(date) {
    return `${date.getFullYear()}-${lp(date.getMonth() + 1)}-${lp(date.getDate())}T${lp(date.getHours() % 12)}:${lp(date.getMinutes())}`;
}

function fromNow(date) {
    let t = Math.ceil(date - new Date()) / 1000;
    const inPast = t < 0 ? -1 : 1;
    t = Math.abs(t);
    if (t < 60) {
        return [t * inPast, 'second'];
    }
    t = Math.floor(t / 60);
    if (t < 60) {
        return [t * inPast, 'minute'];
    }
    t = Math.floor(t / 60);
    if (t < 24) {
        return [t * inPast, 'hour'];
    }
    t = Math.floor(t / 24);
    if (t < 7) {
        return [t * inPast, 'day'];
    }
    t = Math.floor(t / 7);
    if (t < 52) {
        return [t * inPast, 'week'];
    }
    return [Math.floor(t/365) * inPast, 'year'];
}

const response = await fetch('/api/users/me', {
    cache: 'no-cache',
    credentials: 'include'
});
if (!response.ok) {
    console.log('unable to load user profile');
} else {
    try {
        console.log(await response.json());
    } catch (error) {
        console.error(error);
    }
}

let timers = [];
const timerResp = await fetch('/api/timers', {
    cache: 'no-cache',
    credentials: 'include'
});
if (!timerResp.ok) {
    console.log('unable to load timers');
} else {
    try {
        timers = await timerResp.json();
    } catch (error) {
        console.error(error);
    }
}

// Handle removing timers
function removeTimerElement(id) {
    const e = document.getElementById('timer-' + id);
    if (e !== null) {
        e.remove();
    }
}

document.removeTimer = function(id) {
    const i = id;
    fetch(`/api/timers/${i}`, {
        method: 'DELETE',
        credentials: 'include'
    })
    .then(response => {
        if (response.ok) {
            removeTimerElement(i);
        } else {
            console.log('could not remove timer:', i);
        }
    })
    .catch(e => console.error(e));
}

// Set min date threshold
const datetime = document.getElementById('datetime');
datetime.min = parseDateForInput(new Date());

// Submit timer form event handler
let formSubmitted = false;
document.getElementById('form').addEventListener('submit', function(event) {
    event.preventDefault();
    // Validate form values
    const formData = new FormData(event.target);
    const datetime = formData.get('datetime');
    if (datetime === null || datetime.length === 0) {
        console.log('null date and time provided');
        return;
    }
    const asDate = new Date(datetime);
    if (asDate <= new Date()) {
        console.log('invalid date and time provided');
        return;
    }
    formData.set('datetime', asDate.toISOString());

    // Debounce form submission
    if (formSubmitted) {
        return;
    }
    formSubmitted = true;

    fetch('/api/timers', {
        method: 'POST',
        credentials: 'include',
        headers: {
            'content-type': 'application/x-www-form-urlencoded'
        },
        body: new URLSearchParams(formData)
    })
    .then(resp => {
        if (!resp.ok) {
            formSubmitted = false;
            console.log('unable to submit timer form');
            return;
        }
        location.assign('/');
    })
    .catch(err => {
        formSubmitted = false;
    });
});

// debug
//timers = [{id: "123", datetime: "2022-06-09T07:04:28.590Z", description: "Soon!"}]

// Add timers to page
const timersElem = document.getElementById('timers');
const timersList = document.createDocumentFragment();
for (const timer of timers) {
    try {
        const z = new Date(parseDate(timer.datetime));
        const diff = fromNow(z);
        let sep = 'is';
        if (diff[0] < 0) {
            sep = 'was';
        }
        if (timer.description === undefined) {
            sep = '';
        }
        const v = `${sep} ${new Intl.RelativeTimeFormat().format(...diff)}`;
        const h = `
            <div class="column" id="timer-${timer.id}">
                <div class="card">
                    <div class="card-details"><strong>${timer.description || ''}</strong> ${v}</div>
                    <input class="button button-clear card-button" onclick="removeTimer('${timer.id}')" value="🗑️">
                </div>
            </div>
        `;
        const row = document.createElement('div');
        row.classList.add('row');
        row.innerHTML = h;
        timersList.appendChild(row);
    } catch (err) {
        console.log('unable to load timer:', timer, err);
    }
}
timersElem.appendChild(timersList);
