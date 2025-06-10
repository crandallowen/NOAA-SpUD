<script setup>
import assignmentQueryUrl from '@/assets/getDOCAssignments.QRY';
import proposalQueryUrl from '@/assets/getDOCProposals.QRY';
import { upload } from '@/js/api';
import { ref, useTemplateRef } from 'vue';
import router from '@/router';

const assignmentFileInput = useTemplateRef('aInput');
const proposalFileInput = useTemplateRef('pInput');
const bothFilesSelected = ref(false);

function handleFileSelect(event) {
	if (!validateFileSelection(event)) {
        alert('Incorrect file type. Please select a different file with extension ".txt".');
        event.target.value = "";
    } else
        bothFilesSelected.value = (assignmentFileInput.value.files.length !== 0 && proposalFileInput.value.files.length !== 0) ? true : false;
};

function validateFileSelection(event) {
    return !event.target.files[0].type !== 'text/plain' && /\.txt$/.test(event.target.files[0].name);
};

function handleUpload() {
    document.body.style.cursor = 'wait';
    upload(assignmentFileInput.value.files[0], proposalFileInput.value.files[0])
        .then((data) => {
            document.body.style.cursor = 'default';
            alert(data.message);
            if (data.status === 0)
                router.push('/');
        });
};
</script>
<template>
    <div id="container">
        <div id="leftColumn" class="flexColumn">
            <h1 id="title">Upload</h1>           
            <h3>Assignment File:</h3>
			<input ref="aInput" type="file" accept=".txt" @change="handleFileSelect"/>
            <h3>Proposal File:</h3>
			<input ref="pInput" type="file" accept=".txt" @change="handleFileSelect"/>
            <button id="uploadButton" @click.stop="handleUpload" :disabled="!bothFilesSelected">Upload</button>
		</div>
		<div id="rightColumn" class="flexColumn">
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

input {
    margin-bottom: 8px;
    background-color: revert;
}

button {
    margin-top: 8px;
}

h3 {
    padding-right: 5px;
}
</style>