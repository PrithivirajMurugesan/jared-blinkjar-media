// Get data from the API


async function getData() {
  try {
    // const response = data;

    const response = await fetch("http://localhost:3000/api/schedules").then(
      (res) => res.json()
    );
    return response;
  } catch (error) {
    console.error("Error fetching data:", error); // Handle any errors
  }
}

const branches = new Set();
const studios = new Set();
const titles = new Set();

function populateDropdown(elementId, values, allOptionText) {
  const dropdown = document.getElementById(elementId);
  dropdown.innerHTML = "";

  // Add 'All' option
  const allOption = document.createElement("option");
  allOption.value = "all";
  allOption.text = allOptionText;
  dropdown.appendChild(allOption);

  values.forEach((value) => {
    const option = document.createElement("option");
    option.value = value;
    option.text = value;
    dropdown.appendChild(option);
  });
}

// Populate the dropdown

const setPoplulateData = async () => {
  const response = await getData();
   response.items.forEach((item) => {
      if (item.branch_name) branches.add(item.branch_name);
      if (item.studio_name) studios.add(item.studio_name);
      if (item.title) titles.add(item.title);
    });
  populateDropdown("branchDropdown", branches, "Select Location");
  populateDropdown("studioDropdown", studios, "All Studios");
  populateDropdown("titleDropdown", titles, "All classes");
};

setPoplulateData();

// Render the DOM 

document.addEventListener("DOMContentLoaded", async function () {
  let data = await getData();
  const branchDropdown = document.getElementById("branchDropdown");
  const studioDropdown = document.getElementById("studioDropdown");
  const titleDropdown = document.getElementById("titleDropdown");
  const infoMessage = document.getElementById("infoMessage");

  function renderCalendar(filteredEvents, startDate) {
    const currentDate = new Date();
    calendarElement.innerHTML = ""; // Clear previous calendar content
    const daysInWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

    let currentWeek = document.createElement("tr");
    let currentDateInWeek = new Date(startDate);

    // Ensure filteredEvents is an array before proceeding
    if (!Array.isArray(filteredEvents)) {
      filteredEvents = []; // Initialize as an empty array if not already
    }

    const groupedItems = filteredEvents.reduce((acc, item) => {
      const date = item.start_at.split("T")[0]; // Extract the date portion from start_at
      const time = item.start_at.split("T")[1].slice(0, 5); // Extract the time portion from start_at
      const existingGroup = acc.find((group) => group.date === date);
      if (existingGroup) {
        existingGroup.events.push({ ...item, time });
      } else {
        acc.push({ date: date, events: [{ ...item, time }] });
      }
      return acc;
    }, []);


    if (mobileView) {
      const dayEvents = groupedItems.find(
        (event) =>
          new Date(event.date).toDateString() ===
          currentDateInWeek.toDateString()
      );

      const dayElement = document.createElement("td");
      const isToday =
        currentDateInWeek.toDateString() === currentDate.toDateString();
      dayElement.innerHTML = `<div class="date-container${
        isToday ? " today" : ""
      }">
                                        <span class="date">${currentDateInWeek.getDate()}</span>
                                        <span class="day">${
                                          daysInWeek[currentDateInWeek.getDay()]
                                        }</span>
                                    </div>`;

      if (dayEvents) {
        dayEvents.events.forEach((event) => {
          if (event.thumbnail_url && event.instructor_name) {
            const mainClassElement = document.createElement("div");
            mainClassElement.classList.add("main_class");

            const topDiv = document.createElement("div");
            topDiv.classList.add("top_div");

            const eventElement = document.createElement("div");
            eventElement.classList.add("event");
            eventElement.innerHTML = `${
              event.thumbnail_url || event.instructor_name
                ? `<div class="time">${event.time}</div>`
                : ""
            }
                                            ${
                                              event.thumbnail_url
                                                ? `<img src="${event.thumbnail_url}" alt="${event.source_assoc_name}" />`
                                                : ""
                                            }
                                            ${
                                              event.instructor_name
                                                ? `<div class="instructor_name">${event.instructor_name}</div>`
                                                : ""
                                            }`;

            const extraDivElement = document.createElement("div");
            extraDivElement.classList.add("extra_div");
            extraDivElement.innerHTML = `<div class="images">
                        <div class="box_one">
                        <img src="//www.motionvibe.com/images/duration_icon_background.png" alt="duration_icon"/>
                        <p class="duration_time">${event.formattedTimeDifference}</p></div>

                        <div class="box_two">
                        <img src="//www.motionvibe.com/images/burn_icon_background.png" alt="burn_icon"/>
                        </div>
                        </div>
                        <img class="info_down" id="info_down" src="//www.motionvibe.com/images/info_label_closed.png" alt="info_down">`;

            const descriptionDiv = document.createElement("div");
            descriptionDiv.classList.add("desc_para");
            descriptionDiv.innerHTML = `<div><p class="description_title">Description</p>
                        <p class="description">${event.description}</p>
                        <img class="info_up" src ="//www.motionvibe.com/images/info_label_open.png" alt="info_up"/>
                        </div>`;

            mainClassElement.appendChild(topDiv);
            topDiv.appendChild(eventElement);
            topDiv.appendChild(extraDivElement);
            mainClassElement.appendChild(descriptionDiv);
            dayElement.appendChild(mainClassElement);

            mainClassElement.addEventListener("click", (ev) => {
              if (
                mainClassElement.getElementsByClassName("info_down")[0].style
                  .display === "none"
              ) {
                mainClassElement.getElementsByClassName(
                  "info_down"
                )[0].style.display = "block";
              } else {
                mainClassElement.getElementsByClassName(
                  "info_down"
                )[0].style.display = "none";
              }
              const infoDown = document.querySelectorAll(".info_down");
              // Check the current display state of descriptionDiv
              const isDescriptionVisible =
                descriptionDiv.style.display === "block";

              // Toggle descriptionDiv visibility
              if (isDescriptionVisible) {
                descriptionDiv.style.display = "none";
              } else {
                descriptionDiv.style.display = "block";
              }
            });
          }
        });
      }

      currentWeek.appendChild(dayElement);
      calendarElement.appendChild(currentWeek);
    } else {
      // Add blank cells for the days before the first event
      for (let i = 0; i < currentDateInWeek.getDay(); i++) currentWeek.appendChild(document.createElement("td"));

      for (let i = 0; i < 7; i++) {
        const dayEvents = groupedItems.find(
          (event) => {
            return new Date(event.date).toDateString() === currentDateInWeek.toDateString()
          }
        );


        const dayElement = document.createElement("td");
        const isToday =
          currentDateInWeek.toDateString() === currentDate.toDateString();
        dayElement.innerHTML = `<div class="date-container${
          isToday ? " today" : ""
        }">
                                            <span class="date">${currentDateInWeek.getDate()}</span>
                                            <span class="day">${
                                              daysInWeek[
                                                currentDateInWeek.getDay()
                                              ]
                                            }</span>
                                        </div>`;

        if (dayEvents) {
          dayEvents.events.forEach((event) => {
            if (event.thumbnail_url && event.instructor_name) {
              const anchorElement = document.createElement("a");
              anchorElement.href = `${
                event.registration_url || event.live_stream_url
              }`;
              anchorElement.style = "text-decoration: none;";
              if (event.registration_url || event.live_stream_url) {
                const eventElement = document.createElement("div");
                eventElement.classList.add("event");
                eventElement.innerHTML = `${
                  event.thumbnail_url || event.instructor_name
                    ? `<div class="time" style="color:#000; font-size:14px; padding-bottom: 3px;">${event.time}</div>`
                    : ""
                }
                                                ${
                                                  event.thumbnail_url
                                                    ? `<img src="${event.thumbnail_url}" alt="${event.source_assoc_name}" />`
                                                    : ""
                                                }
                                                ${
                                                  event.instructor_name
                                                    ? `<div style="color:#000; padding-top: 3px; font-size:11px;">${event.instructor_name}</div>`
                                                    : ""
                                                }`;

                anchorElement.appendChild(eventElement);
                dayElement.appendChild(anchorElement);
              }
            }
          });
        }

        currentWeek.appendChild(dayElement);

        if (currentDateInWeek.getDay() === 6) {
          // Saturday
          calendarElement.appendChild(currentWeek);
          currentWeek = document.createElement("tr");
        }

        currentDateInWeek.setDate(currentDateInWeek.getDate() + 1);
      }

      calendarElement.appendChild(currentWeek);
    }
  }

  function handleInitialState() {
    const selectedBranch = branchDropdown.value;

    if (selectedBranch === "all") {
      // Display info message and hide other dropdowns
      infoMessage.style.display = "block";
      studioDropdown.style.display = "none";
      titleDropdown.style.display = "none";
    } else {
      // Hide info message and show other dropdowns
      infoMessage.style.display = "none";
      studioDropdown.style.display = "block";
      titleDropdown.style.display = "block";
    }
  }

  function filterEvents() {
    const selectedBranch = branchDropdown.value;
    const selectedStudio = studioDropdown.value;
    const selectedTitle = titleDropdown.value;

    if (selectedBranch === "all") {
      // Display info message and hide other dropdowns
      infoMessage.style.display = "block";
      studioDropdown.style.display = "none";
      titleDropdown.style.display = "none";
    } else {
      // Hide info message and show other dropdowns
      infoMessage.style.display = "none";
      studioDropdown.style.display = "block";
      titleDropdown.style.display = "block";
    }

    const filteredEvents = data.items.filter((event) => {
      return (
        (selectedBranch === "all" || event.branch_name === selectedBranch) &&
        (selectedStudio === "all" || event.studio_name === selectedStudio) &&
        (selectedTitle === "all" || event.title === selectedTitle)
      );
    });

    renderCalendar(filteredEvents, currentStartDate); // Update calendar with filtered events
  }

  handleInitialState();

  branchDropdown.addEventListener("change", filterEvents);
  studioDropdown.addEventListener("change", filterEvents);
  titleDropdown.addEventListener("change", filterEvents);

  // Filtered Select Option ends

  // store the dropdown value to local storage starts
  const dropdown1 = document.getElementById("branchDropdown");

  dropdown1.addEventListener("change", (event) => {
    const selectedValue = event.target.value;

    localStorage.setItem("selectedValue", selectedValue);
    window.dispatchEvent(new Event("storage"));
  });

  // store the dropdown value to local storage ends

  // Pop up for print button starts

  document.querySelector("#print_doc").addEventListener("click", function () {
    document.querySelector(".custom-model-main").style.display = "block";
    document.querySelector("#calendar").style.display = "none";
    document.querySelector(".bg-overlay").style.display = "block";
    document.querySelector(".widget_filter").style.zIndex = "-3";
    document.querySelector(".custom-model-main").classList.add("model-open");
  });
  document
    .querySelector(".close-btn, .bg-overlay")
    .addEventListener("click", function () {
      document.querySelector("#calendar").style.display = "flex";
      document.querySelector("#calendar").style.justifyContent = "center";
      document.querySelector(".widget_filter").style.zIndex = "0";
      document
        .querySelector(".custom-model-main")
        .classList.remove("model-open");
    });

  const openPdf = document.getElementById("downloadPdf");
  openPdf.addEventListener("click", () => {
    window.localStorage.setItem("date", startDateElement.innerText);
    window.location.href = "events.html";
  });

  const cancelButton = document.getElementById("cancelButton");
  const popUpDiv = document.getElementById("popUp");

  cancelButton.addEventListener("click", function () {
    document.querySelector(".custom-model-main").style.display = "none";
    document.querySelector(".bg-overlay").style.display = "none";
    document.querySelector("#calendar").style.display = "flex";
    document.querySelector("#calendar").style.justifyContent = "center";
    document.querySelector(".widget_filter").style.zIndex = "0";
    popUpDiv.classList.remove("model-open");
  });

  // popup dropdown values starts

  const popUpStudios = new Set();
  const popUpTitles = new Set();

  data.items.forEach((item) => {
    if (item.studio_name) popUpStudios.add(item.studio_name);
    if (item.title) popUpTitles.add(item.title);
  });

  function populateDropdownPopUp(elementId, values, allOptionText) {
    const popUpDropdown = document.getElementById(elementId);
    popUpDropdown.innerHTML = "";

    // Add 'All' option
    const allOptionPopUp = document.createElement("option");
    allOptionPopUp.value = "all";
    allOptionPopUp.text = allOptionText;
    popUpDropdown.appendChild(allOptionPopUp);

    values.forEach((value) => {
      const popUpOption = document.createElement("option");
      popUpOption.value = value;
      popUpOption.text = value;
      popUpDropdown.appendChild(popUpOption);
    });
  }

  populateDropdownPopUp("popupStudio", popUpStudios, "All Studios");
  populateDropdownPopUp("popupClasses", popUpTitles, "All classes");

  const popUpStudioDropdown = document.getElementById("popupStudio");
  const popUpTitleDropdown = document.getElementById("popupClasses");

  function popUpFilterEvents() {
    const popUpSelectedStudio = popUpStudioDropdown.value;
    const popUpSelectedTitle = popUpTitleDropdown.value;

    const popUpFilteredEvents = data.items.filter((event) => {
      return (
        (popUpSelectedStudio === "all" ||
          event.studio_name === popUpSelectedStudio) &&
        (popUpSelectedTitle === "all" || event.title === popUpSelectedTitle)
      );
    });

    renderCalendar(popUpFilteredEvents, currentStartDate); // Update calendar with filtered events
  }

  popUpStudioDropdown.addEventListener("change", popUpFilterEvents);
  popUpTitleDropdown.addEventListener("change", popUpFilterEvents);

  // popup dropdown values ends

  // Pop up for print button ends

  // Shows Time in Hours format starts
  data.items.forEach((item) => {
    // Parse the start_at and end_at times
    const startTime = new Date(item.start_at);
    const endTime = new Date(item.end_at);

    // Calculate the difference in milliseconds
    const timeDifferenceMillis = endTime - startTime;

    // Convert the difference to hours
    const timeDifferenceHours = timeDifferenceMillis / (1000 * 60 * 60);

    // Calculate the number of full days
    const days = Math.floor(timeDifferenceHours / 24);

    // Calculate the remaining hours and minutes
    const remainingHours = timeDifferenceHours % 24;
    const hours = Math.floor(remainingHours);
    const minutes = Math.round((remainingHours - hours) * 60);

    // Format hours and minutes
    const formattedTime = `${hours < 10 ? "0" + hours : hours}.${
      minutes < 10 ? "0" + minutes : minutes
    }`;

    // Store the formatted time in the item object
    item.formattedTimeDifference = formattedTime;
  });

  // Shows Time in Hours format ends

  // Line showing conditions starts

  const line = document.getElementById("line_show");
  const banner = document.getElementById("banner_show");
  if (banner === "none") {
    line.style.display = "block";
  } else {
    line.style.display = "none";
  }

  // Line showing conditions ends

  // Date Picker render in the events calender starts

  const datePickerButton = document.getElementById("date-picker-button");
  const datePicker = document.getElementById("date-picker");
  const startDateElement = document.getElementById("start-date");
  const calendarElement = document.querySelector("#calendar tbody");
  let eventsData = [];
  const mobileView = window.innerWidth <= 480;

  // Date Picker render in the events calender ends

  // Date rendered by the week starts

  function getStartOfWeek(date) {
    const startOfWeek = new Date(date);
    const day = startOfWeek.getDay();
    const diff = startOfWeek.getDate() - day;
    startOfWeek.setDate(diff);
    return startOfWeek;
  }

  let currentStartDate = getStartOfWeek(new Date());
  startDateElement.textContent = currentStartDate.toLocaleDateString(
    undefined,
    { month: "short", day: "numeric", year: "numeric" }
  );

  datePickerButton.addEventListener("click", function () {
    datePicker.style.display = "block";
    datePicker.focus();
  });

  datePicker.addEventListener("blur", function () {
    datePicker.style.display = "none";
  });

  datePicker.addEventListener("change", function () {
    const selectedDate = new Date(datePicker.value);
    currentStartDate = getStartOfWeek(selectedDate);
    startDateElement.textContent = currentStartDate.toLocaleDateString(
      undefined,
      { month: "short", day: "numeric", year: "numeric" }
    );
    renderCalendar(filterEvents, currentStartDate);
    filterEvents();
  });

  // Date rendered by the week ends

  // Conditions for prev & next arrow for displaying Week by Week Starts

  document.getElementById("next_week").addEventListener("click", () => {
    if (mobileView) {
      currentStartDate.setDate(currentStartDate.getDate() + 1);
    } else {
      currentStartDate.setDate(currentStartDate.getDate() + 7);
    }
    startDateElement.textContent = currentStartDate.toLocaleDateString(
      undefined,
      { month: "short", day: "numeric", year: "numeric" }
    );
    renderCalendar(filterEvents, currentStartDate);
    filterEvents();
  });

  document.getElementById("previous_week").addEventListener("click", () => {
    if (mobileView) {
      currentStartDate.setDate(currentStartDate.getDate() - 1);
    } else {
      currentStartDate.setDate(currentStartDate.getDate() - 7);
    }
    startDateElement.textContent = currentStartDate.toLocaleDateString(
      undefined,
      { month: "short", day: "numeric", year: "numeric" }
    );
    renderCalendar(filterEvents, currentStartDate);
    filterEvents();
  });

  // Conditions for prev & next arrow for displaying Week by Week ends

  // Hide the loading animation
  setTimeout(() => {
    document.querySelector(".loading").style.display = "none";
    renderCalendar(eventsData, new Date(currentStartDate));
  }, 2000);

  // Initial render with all events
  renderCalendar(filterEvents, currentStartDate);
});

