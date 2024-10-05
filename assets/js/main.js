
/*=============== SHOW MENU ===============*/
const headerToggle = document.getElementById('header-toggle'),
    main = document.getElementById('main'),
    navClose = document.getElementById('nav-close');

if (headerToggle) {
    headerToggle.addEventListener('click', () => {
        main.classList.add('show-menu');
    });
}

if (navClose) {
    navClose.addEventListener('click', () => {
        main.classList.remove('show-menu');
    });
}

/*=============== XOA MENU DIEN THOAI ===============*/
const navLink = document.querySelectorAll('.nav--link');
const profileLink = document.getElementById('profile-toggle'); // Add profile link here
const homepageLink = document.getElementById('homepage-toggle');

function linkAction(e) {
    const main = document.getElementById('main');

    // If "My Profile" is clicked, do not remove the menu
    if (e.target === profileLink || profileLink.contains(e.target)) {
        return;
    }

    if (e.target === homepageLink || homepageLink.contains(e.target)) {
        return; // Skip removing the menu when "Homepage" is clicked
    }

    // For other links, remove the 'show-menu' class
    main.classList.remove('show-menu');
}
navLink.forEach(n => n.addEventListener('click', linkAction));

function scrollHeader() {
    const header = document.getElementById('header');
    // When the scroll is greater than 50 viewport height, add the scroll-header class to the header tag
    if (this.scrollY >= 50) header.classList.add('scroll-header'); else header.classList.remove('scroll-header');
}
window.addEventListener('scroll', scrollHeader);

/*=============== SCROLL SECTIONS ACTIVE LINK ===============*/
const sections = document.querySelectorAll('section[id]');

function scrollActive() {
    const scrollY = window.pageYOffset;

    sections.forEach(current => {
        const sectionHeight = current.offsetHeight,
            sectionTop = current.offsetTop - 58,
            sectionId = current.getAttribute('id');

        if (scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
            document.querySelector('.nav--menu a[href*=' + sectionId + ']').classList.add('active-link');
        } else {
            document.querySelector('.nav--menu a[href*=' + sectionId + ']').classList.remove('active-link');
        }
    });
}
window.addEventListener('scroll', scrollActive);

// dropdown

/*=============== SHOW/HIDE DROPDOWN ===============*/
const dropdowns = document.querySelectorAll('.nav--dropdown');
const dropdownIcons = document.querySelectorAll('.bx-chevron-down');

function toggleDropdown(toggleElement, dropdownElement, iconElement) {
    toggleElement.addEventListener('click', (e) => {
        e.preventDefault();

        const isActive = dropdownElement.classList.contains('active');

        // If the clicked dropdown is active, collapse it
        if (isActive) {
            collapseDropdown(dropdownElement, iconElement);
        } else {
            // Collapse any currently active dropdowns
            dropdowns.forEach((dropdown, index) => {
                if (dropdown !== dropdownElement && dropdown.classList.contains('active')) {
                    collapseDropdown(dropdown, dropdownIcons[index]);
                }
            });

            dropdownElement.style.height = dropdownElement.scrollHeight + 'px';
            dropdownElement.classList.add('active');
            iconElement.classList.add('active');
        }
    });
}

function collapseDropdown(dropdownElement, iconElement) {
    dropdownElement.style.height = dropdownElement.scrollHeight + 'px'; // Set current height before collapsing
    setTimeout(() => {
        dropdownElement.style.height = '0px';
    }, 0);
    dropdownElement.classList.remove('active');
    iconElement.classList.remove('active');
}

const homepageToggle = document.getElementById('homepage-toggle');
const homepageDropdown = document.getElementById('homepage-dropdown');
const homepageIcon = homepageToggle.querySelector('.bx-chevron-down');

const profileToggle = document.getElementById('profile-toggle');
const profileDropdown = document.getElementById('profile-dropdown');
const profileIcon = profileToggle.querySelector('.bx-chevron-down');

toggleDropdown(homepageToggle, homepageDropdown, homepageIcon);
toggleDropdown(profileToggle, profileDropdown, profileIcon);


