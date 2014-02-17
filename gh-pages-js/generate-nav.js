/*jshint browser: true, smarttabs: false, indent: 4, undef: true, unused: true, strict: true, trailing: true, onevar: true, white: true, laxbreak: true */

(function () {
    'use strict';

    var $insertNav = document.querySelector('.js-insert-nav'),
        $sections = document.querySelectorAll('.content > section'),
        subCounter = 0;

    buildMarkup($sections);

    function getFirstHeading($parent) {
        return $parent.querySelector('h1, h2, h3, h4, h5, h6');
    }

    function buildMarkup($sections, isChildren) {
        var $currentSection,
            $currentHeading,
            $childrenSections,
            currentId = '',
            iterator = 0,
            sectionsLength = $sections.length,
            navMarkup = isChildren ? '<ul>' : '<nav class="block-nav"><ul>';

        subCounter += 1;

        for (iterator; iterator < sectionsLength; iterator += 1) {
            $currentSection = $sections[iterator];
            $currentHeading = getFirstHeading($currentSection);
            $childrenSections = $currentSection.querySelectorAll('section');
            currentId = $currentSection.getAttribute('id');

            if (!currentId) {
                currentId = 'generated-nav-id-' + subCounter + '-' + iterator;
                $currentSection.id = currentId;
            }

            

            if ($childrenSections.length) {
                navMarkup += '<li class="dropdown"><a href="#' + currentId + '">' + $currentHeading.innerHTML + '</a>';
                navMarkup += buildMarkup(document.querySelectorAll('#' + currentId + ' > section'), true);
            } else {
                navMarkup += '<li><a href="#' + currentId + '">' + $currentHeading.innerHTML + '</a>';
            }

            navMarkup += '</li>';
        }

        navMarkup += isChildren ? '</ul>' : '</ul></nav>';

        $insertNav.innerHTML = navMarkup;

        return navMarkup;
    }

}());