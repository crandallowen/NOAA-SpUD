<script setup>
import assignmentQueryUrl from '@/assets/getDOCAssignments.QRY';
import proposalQueryUrl from '@/assets/getDOCProposals.QRY';
import { upload } from '@/js/api';
import { ref } from 'vue';

const assignment_file = ref();
const proposal_file = ref();

function handleAssignmentFileUpload(event) {
	if (validateFileUpload(event))
    	assignment_file.value = event.target.files[0];
	else
		alert('Incorrect file type');
};

function handleProposalFileUpload(event) {
	if (validateFileUpload(event))
		proposal_file.value = event.target.files[0];
	else
		alert('Incorrect file type');
};

function validateFileUpload(event) {
	if (event.target.files[0].type !== 'text/plain')
		return false;
	else if (!/\.txt$/.test(event.target.files[0].name))
		return false;
	else
		return true;
};
</script>
<template>
    <div id="container">
        <div id="leftColumn" class="column">
            <h1 id="title">Upload</h1>           
            <h3>Assignment File:</h3>
			<input ref="afile" type="file" accept=".txt" @change="handleAssignmentFileUpload"/>
            <h3>Proposal File:</h3>
			<input ref="pfile" type="file" accept=".txt" @change="handleProposalFileUpload"/>
            <button id="uploadButton" @click.stop="upload(assignment_file, proposal_file)">Upload</button>
		</div>
		<div id="rightColumn" class="column">
            <div id="infoBox">
                <p>Uploaded files will refresh the database with new up-to-date data.</p>
                <p>Uploads through this page are not additive (i.e., all old data will be discarded and new data will be populated from provided files)</p>
                <p>The assignment and proposal files should both be .txt files obtained directly from Spectrum XXI.</p>
                <p>The files should either be in SFAF or GMF 1 column format, but SFAF is preferred as it contains data not found in GMF format.</p>
                <p>The queries below and can be loaded into Spectrum XXI to obtain each of the necessary files.</p>
                <p>The assignment .QRY file can be found here: <a :href="assignmentQueryUrl" download="getDOCAssignments.QRY">getDOCAssignments.QRY</a></p>
                <p>The proposal .QRY file can be found here: <a :href="proposalQueryUrl" download="getDOCProposals.QRY">getDOCProposals.QRY</a></p>
            </div>
		</div>
	</div>
</template>
<style scoped>
#container {
    display: flex;
    justify-content: center;
    width: 66vw;
    margin: 0 auto;
}
#title {
    color: var(--color-heading);
}
#infoBox {
    padding: 8px 16px;
    background: var(--color-background-mute);
    border-radius: 4px;
	margin-bottom: 20px;
}
#infoBox > p:last-child {
    margin-bottom: 0;
}
#infoBox > p {
    margin-bottom: 8px;
}
#leftColumn {
    flex-grow: 1;
    margin-right: 4px;
}
#rightColumn {
    max-width: 33vw;
}
.column {
    display: flex;
    flex-direction: column;
}
input::file-selector-button, button {
    background-color: var(--color-background-soft);
    border: 1px solid var(--color-border);
    color: var(--color-text);
    border-radius: 4px;
    padding: 2px 5px;
	font-family: inherit;
    font-size: 18px;
}
input {
    color: var(--color-text);
    font-family: inherit;
    font-size: 18px;
    margin-bottom: 8px;
    width: fit-content;
}
button {
    cursor: pointer;
    width: fit-content;
    margin-top: 8px;
}
@media (hover: hover) {
  button:hover {
    border-color: var(--color-border-hover);
  }
}
button:disabled, button[disabled] {
    color: var(--color-text-inactive);
    cursor: default;
}
h3 {
    padding-right: 5px;
}
a:link {
    color: var(--color-link);
}
a:visited {
    color: var(--color-link-visited);
}
</style>