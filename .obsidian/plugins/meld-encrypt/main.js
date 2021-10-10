'use strict';

var obsidian = require('obsidian');

/*! *****************************************************************************
Copyright (c) Microsoft Corporation.

Permission to use, copy, modify, and/or distribute this software for any
purpose with or without fee is hereby granted.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
PERFORMANCE OF THIS SOFTWARE.
***************************************************************************** */

function __awaiter(thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
}

class DecryptModal extends obsidian.Modal {
    constructor(app, title, text = '') {
        super(app);
        this.decryptInPlace = false;
        this.text = text;
        this.titleEl.innerText = title;
    }
    onOpen() {
        let { contentEl } = this;
        const textEl = contentEl.createDiv().createEl('textarea', { text: this.text });
        textEl.style.width = '100%';
        textEl.style.height = '100%';
        textEl.rows = 10;
        textEl.readOnly = true;
        //textEl.focus(); // Doesn't seem to work here...
        setTimeout(() => { textEl.focus(); }, 100); //... but this does
        const btnContainerEl = contentEl.createDiv('');
        const decryptInPlaceBtnEl = btnContainerEl.createEl('button', { text: 'Decrypt in-place' });
        decryptInPlaceBtnEl.addEventListener('click', () => {
            this.decryptInPlace = true;
            this.close();
        });
        const cancelBtnEl = btnContainerEl.createEl('button', { text: 'Close' });
        cancelBtnEl.addEventListener('click', () => {
            this.close();
        });
    }
}

class PasswordModal extends obsidian.Modal {
    constructor(app, confirmPassword, defaultPassword = null) {
        super(app);
        this.password = null;
        this.defaultPassword = null;
        this.defaultPassword = defaultPassword;
        this.confirmPassword = confirmPassword;
    }
    onOpen() {
        var _a, _b;
        let { contentEl } = this;
        contentEl.empty();
        const inputPwContainerEl = contentEl.createDiv();
        inputPwContainerEl.createSpan({ text: '🔑 ' });
        const pwInputEl = inputPwContainerEl.createEl('input', { type: 'password', value: (_a = this.defaultPassword) !== null && _a !== void 0 ? _a : '' });
        pwInputEl.placeholder = 'Enter your password';
        pwInputEl.style.width = '70%';
        pwInputEl.focus();
        const inputInputNextBtnEl = inputPwContainerEl.createEl('button', { text: '→' });
        inputInputNextBtnEl.style.display = 'inline';
        inputInputNextBtnEl.style.marginLeft = "1em";
        inputInputNextBtnEl.style.width = "4em";
        inputInputNextBtnEl.addEventListener('click', (ev) => {
            inputPasswordHandler();
        });
        const confirmPwContainerEl = contentEl.createDiv();
        confirmPwContainerEl.style.marginTop = '1em';
        confirmPwContainerEl.createSpan({ text: '🔑 ' });
        const pwConfirmInputEl = confirmPwContainerEl.createEl('input', { type: 'password', value: (_b = this.defaultPassword) !== null && _b !== void 0 ? _b : '' });
        pwConfirmInputEl.placeholder = 'Confirm your password';
        pwConfirmInputEl.style.width = '70%';
        const confirmInputNextBtnEl = confirmPwContainerEl.createEl('button', { text: '→' });
        confirmInputNextBtnEl.style.display = 'inline';
        confirmInputNextBtnEl.style.marginLeft = "1em";
        confirmInputNextBtnEl.style.width = "4em";
        confirmInputNextBtnEl.addEventListener('click', (ev) => {
            confirmPasswordHandler();
        });
        const inputPasswordHandler = () => {
            if (this.confirmPassword) {
                // confim password
                pwConfirmInputEl.focus();
            }
            else {
                this.password = pwInputEl.value;
                this.close();
            }
        };
        const confirmPasswordHandler = () => {
            if (pwInputEl.value == pwConfirmInputEl.value) {
                this.password = pwConfirmInputEl.value;
                this.close();
            }
            else {
                // passwords don't match
                messageEl.setText('Passwords don\'t match');
                messageEl.show();
            }
        };
        pwConfirmInputEl.addEventListener('keypress', (ev) => {
            if ((ev.code === 'Enter' || ev.code === 'NumpadEnter')
                && pwConfirmInputEl.value.length > 0) {
                ev.preventDefault();
                confirmPasswordHandler();
            }
        });
        if (!this.confirmPassword) {
            confirmPwContainerEl.hide();
        }
        const messageEl = contentEl.createDiv();
        messageEl.style.marginTop = '1em';
        messageEl.hide();
        pwInputEl.addEventListener('keypress', (ev) => {
            if ((ev.code === 'Enter' || ev.code === 'NumpadEnter')
                && pwInputEl.value.length > 0) {
                ev.preventDefault();
                inputPasswordHandler();
            }
        });
        // const btnContainerEl = contentEl.createDiv('');
        // btnContainerEl.style.marginTop = '1em';
        // const okBtnEl = btnContainerEl.createEl('button', { text: 'OK' });
        // okBtnEl.addEventListener('click', () => {
        // 	this.password = pwInputEl.value;
        // 	this.close();
        // });
        // const cancelBtnEl = btnContainerEl.createEl('button', { text: 'Cancel' });
        // cancelBtnEl.addEventListener('click', () => {
        // 	this.close();
        // });
    }
}

const vectorSize = 16;
const utf8Encoder = new TextEncoder();
const utf8Decoder = new TextDecoder();
const iterations = 1000;
const salt = utf8Encoder.encode('XHWnDAT6ehMVY2zD');
class CryptoHelperV2 {
    deriveKey(password) {
        return __awaiter(this, void 0, void 0, function* () {
            const buffer = utf8Encoder.encode(password);
            const key = yield crypto.subtle.importKey('raw', buffer, { name: 'PBKDF2' }, false, ['deriveKey']);
            const privateKey = crypto.subtle.deriveKey({
                name: 'PBKDF2',
                hash: { name: 'SHA-256' },
                iterations,
                salt
            }, key, {
                name: 'AES-GCM',
                length: 256
            }, false, ['encrypt', 'decrypt']);
            return privateKey;
        });
    }
    encryptToBase64(text, password) {
        return __awaiter(this, void 0, void 0, function* () {
            const key = yield this.deriveKey(password);
            const textBytesToEncrypt = utf8Encoder.encode(text);
            const vector = crypto.getRandomValues(new Uint8Array(vectorSize));
            // encrypt into bytes
            const encryptedBytes = new Uint8Array(yield crypto.subtle.encrypt({ name: 'AES-GCM', iv: vector }, key, textBytesToEncrypt));
            const finalBytes = new Uint8Array(vector.byteLength + encryptedBytes.byteLength);
            finalBytes.set(vector, 0);
            finalBytes.set(encryptedBytes, vector.byteLength);
            //convert array to base64
            const base64Text = btoa(String.fromCharCode(...finalBytes));
            return base64Text;
        });
    }
    stringToArray(str) {
        var result = [];
        for (var i = 0; i < str.length; i++) {
            result.push(str.charCodeAt(i));
        }
        return new Uint8Array(result);
    }
    decryptFromBase64(base64Encoded, password) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let bytesToDecode = this.stringToArray(atob(base64Encoded));
                // extract iv
                const vector = bytesToDecode.slice(0, vectorSize);
                // extract encrypted text
                const encryptedTextBytes = bytesToDecode.slice(vectorSize);
                const key = yield this.deriveKey(password);
                // decrypt into bytes
                let decryptedBytes = yield crypto.subtle.decrypt({ name: 'AES-GCM', iv: vector }, key, encryptedTextBytes);
                // convert bytes to text
                let decryptedText = utf8Decoder.decode(decryptedBytes);
                return decryptedText;
            }
            catch (e) {
                //console.error(e);
                return null;
            }
        });
    }
}
const algorithmObsolete = {
    name: 'AES-GCM',
    iv: new Uint8Array([196, 190, 240, 190, 188, 78, 41, 132, 15, 220, 84, 211]),
    tagLength: 128
};
class CryptoHelperObsolete {
    buildKey(password) {
        return __awaiter(this, void 0, void 0, function* () {
            let utf8Encode = new TextEncoder();
            let passwordBytes = utf8Encode.encode(password);
            let passwordDigest = yield crypto.subtle.digest({ name: 'SHA-256' }, passwordBytes);
            let key = yield crypto.subtle.importKey('raw', passwordDigest, algorithmObsolete, false, ['encrypt', 'decrypt']);
            return key;
        });
    }
    encryptToBase64(text, password) {
        return __awaiter(this, void 0, void 0, function* () {
            let key = yield this.buildKey(password);
            let utf8Encode = new TextEncoder();
            let bytesToEncrypt = utf8Encode.encode(text);
            // encrypt into bytes
            let encryptedBytes = new Uint8Array(yield crypto.subtle.encrypt(algorithmObsolete, key, bytesToEncrypt));
            //convert array to base64
            let base64Text = btoa(String.fromCharCode(...encryptedBytes));
            return base64Text;
        });
    }
    stringToArray(str) {
        var result = [];
        for (var i = 0; i < str.length; i++) {
            result.push(str.charCodeAt(i));
        }
        return new Uint8Array(result);
    }
    decryptFromBase64(base64Encoded, password) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // convert base 64 to array
                let bytesToDecrypt = this.stringToArray(atob(base64Encoded));
                let key = yield this.buildKey(password);
                // decrypt into bytes
                let decryptedBytes = yield crypto.subtle.decrypt(algorithmObsolete, key, bytesToDecrypt);
                // convert bytes to text
                let utf8Decode = new TextDecoder();
                let decryptedText = utf8Decode.decode(decryptedBytes);
                return decryptedText;
            }
            catch (e) {
                return null;
            }
        });
    }
}

class MeldEncryptSettingsTab extends obsidian.PluginSettingTab {
    constructor(app, plugin) {
        super(app, plugin);
        this.plugin = plugin;
    }
    display() {
        let { containerEl } = this;
        containerEl.empty();
        containerEl.createEl('h2', { text: 'Settings for Meld Encrypt' });
        new obsidian.Setting(containerEl)
            .setName('Confirm password?')
            .setDesc('Confirm password when encrypting.')
            .addToggle(toggle => {
            toggle
                .setValue(this.plugin.settings.confirmPassword)
                .onChange((value) => __awaiter(this, void 0, void 0, function* () {
                this.plugin.settings.confirmPassword = value;
                yield this.plugin.saveSettings();
                this.updateSettingsUi();
            }));
        });
        new obsidian.Setting(containerEl)
            .setName('Remember password?')
            .setDesc('Remember the last used password for this session.')
            .addToggle(toggle => {
            toggle
                .setValue(this.plugin.settings.rememberPassword)
                .onChange((value) => __awaiter(this, void 0, void 0, function* () {
                this.plugin.settings.rememberPassword = value;
                yield this.plugin.saveSettings();
                this.updateSettingsUi();
            }));
        });
        this.pwTimeoutSetting = new obsidian.Setting(containerEl)
            .setName(this.buildPasswordTimeoutSettingName())
            .setDesc('The number of minutes to remember the last used password.')
            .addSlider(slider => {
            slider
                .setLimits(0, 120, 5)
                .setValue(this.plugin.settings.rememberPasswordTimeout)
                .onChange((value) => __awaiter(this, void 0, void 0, function* () {
                this.plugin.settings.rememberPasswordTimeout = value;
                yield this.plugin.saveSettings();
                this.updateSettingsUi();
            }));
        });
        this.updateSettingsUi();
    }
    updateSettingsUi() {
        this.pwTimeoutSetting.setName(this.buildPasswordTimeoutSettingName());
        if (this.plugin.settings.rememberPassword) {
            this.pwTimeoutSetting.settingEl.show();
        }
        else {
            this.pwTimeoutSetting.settingEl.hide();
        }
    }
    buildPasswordTimeoutSettingName() {
        const value = this.plugin.settings.rememberPasswordTimeout;
        let timeoutString = `${value} minutes`;
        if (value == 0) {
            timeoutString = 'Never forget';
        }
        return `Remember Password Timeout (${timeoutString})`;
    }
}

const _PREFIX_OBSOLETE = '%%🔐 ';
const _PREFIX_A = '%%🔐α ';
const _SUFFIX = ' 🔐%%';
const DEFAULT_SETTINGS = {
    confirmPassword: true,
    rememberPassword: true,
    rememberPasswordTimeout: 30
};
class MeldEncrypt extends obsidian.Plugin {
    onload() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.loadSettings();
            this.addSettingTab(new MeldEncryptSettingsTab(this.app, this));
            this.addCommand({
                id: 'encrypt-decrypt',
                name: 'Encrypt/Decrypt',
                checkCallback: (checking) => this.processEncryptDecryptCommand(checking, false)
            });
            this.addCommand({
                id: 'encrypt-decrypt-in-place',
                name: 'Encrypt/Decrypt In-place',
                checkCallback: (checking) => this.processEncryptDecryptCommand(checking, true)
            });
        });
    }
    loadSettings() {
        return __awaiter(this, void 0, void 0, function* () {
            this.settings = Object.assign({}, DEFAULT_SETTINGS, yield this.loadData());
        });
    }
    saveSettings() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.saveData(this.settings);
        });
    }
    processEncryptDecryptCommand(checking, decryptInPlace) {
        if (checking && this.app.workspace.activeLeaf) {
            // ensures this command can show up in other plugins which list commands e.g. customizable-sidebar
            return true;
        }
        const mdview = this.app.workspace.getActiveViewOfType(obsidian.MarkdownView);
        if (!mdview) {
            return false;
        }
        const editor = mdview.editor;
        if (!editor) {
            return false;
        }
        const startLine = editor.getCursor('from').line;
        const startPos = { line: startLine, ch: 0 }; // want the start of the first line
        const endLine = editor.getCursor('to').line;
        const endLineText = editor.getLine(endLine);
        const endPos = { line: endLine, ch: endLineText.length }; // want the end of last line
        const selectionText = editor.getRange(startPos, endPos);
        if (selectionText.length == 0) {
            return false;
        }
        const decrypt_obs = selectionText.startsWith(_PREFIX_OBSOLETE) && selectionText.endsWith(_SUFFIX);
        const decrypt_a = selectionText.startsWith(_PREFIX_A) && selectionText.endsWith(_SUFFIX);
        const decrypt = decrypt_obs || decrypt_a;
        const encrypt = !selectionText.contains(_PREFIX_OBSOLETE) && !selectionText.contains(_SUFFIX);
        if (!decrypt && !encrypt) {
            return false;
        }
        if (checking) {
            return true;
        }
        // Fetch password from user
        // determine default password
        const isRememberPasswordExpired = !this.settings.rememberPassword
            || (this.passwordLastUsedExpiry != null
                && Date.now() > this.passwordLastUsedExpiry);
        const confirmPassword = encrypt && this.settings.confirmPassword;
        if (isRememberPasswordExpired || confirmPassword) {
            // forget password
            this.passwordLastUsed = '';
        }
        const pwModal = new PasswordModal(this.app, confirmPassword, this.passwordLastUsed);
        pwModal.onClose = () => {
            var _a;
            const pw = (_a = pwModal.password) !== null && _a !== void 0 ? _a : '';
            if (pw.length == 0) {
                return;
            }
            // remember password?
            if (this.settings.rememberPassword) {
                this.passwordLastUsed = pw;
                this.passwordLastUsedExpiry =
                    this.settings.rememberPasswordTimeout == 0
                        ? null
                        : Date.now() + this.settings.rememberPasswordTimeout * 1000 * 60 // new expiry
                ;
            }
            if (encrypt) {
                this.encryptSelection(editor, selectionText, pw, startPos, endPos);
            }
            else {
                if (decrypt_a) {
                    this.decryptSelection_a(editor, selectionText, pw, startPos, endPos, decryptInPlace);
                }
                else {
                    this.decryptSelectionObsolete(editor, selectionText, pw, startPos, endPos, decryptInPlace);
                }
            }
        };
        pwModal.open();
        return true;
    }
    encryptSelection(editor, selectionText, password, finalSelectionStart, finalSelectionEnd) {
        return __awaiter(this, void 0, void 0, function* () {
            //encrypt
            const crypto = new CryptoHelperV2();
            const base64EncryptedText = this.addMarkers(yield crypto.encryptToBase64(selectionText, password));
            editor.setSelection(finalSelectionStart, finalSelectionEnd);
            editor.replaceSelection(base64EncryptedText);
        });
    }
    decryptSelection_a(editor, selectionText, password, selectionStart, selectionEnd, decryptInPlace) {
        return __awaiter(this, void 0, void 0, function* () {
            //console.log('decryptSelection_a');
            // decrypt
            const base64CipherText = this.removeMarkers(selectionText);
            const crypto = new CryptoHelperV2();
            const decryptedText = yield crypto.decryptFromBase64(base64CipherText, password);
            if (decryptedText === null) {
                new obsidian.Notice('❌ Decryption failed!');
            }
            else {
                if (decryptInPlace) {
                    editor.setSelection(selectionStart, selectionEnd);
                    editor.replaceSelection(decryptedText);
                }
                else {
                    const decryptModal = new DecryptModal(this.app, '🔓', decryptedText);
                    decryptModal.onClose = () => {
                        editor.focus();
                        if (decryptModal.decryptInPlace) {
                            editor.setSelection(selectionStart, selectionEnd);
                            editor.replaceSelection(decryptedText);
                        }
                    };
                    decryptModal.open();
                }
            }
        });
    }
    decryptSelectionObsolete(editor, selectionText, password, selectionStart, selectionEnd, decryptInPlace) {
        return __awaiter(this, void 0, void 0, function* () {
            //console.log('decryptSelectionObsolete');
            // decrypt
            const base64CipherText = this.removeMarkers(selectionText);
            const crypto = new CryptoHelperObsolete();
            const decryptedText = yield crypto.decryptFromBase64(base64CipherText, password);
            if (decryptedText === null) {
                new obsidian.Notice('❌ Decryption failed!');
            }
            else {
                if (decryptInPlace) {
                    editor.setSelection(selectionStart, selectionEnd);
                    editor.replaceSelection(decryptedText);
                }
                else {
                    const decryptModal = new DecryptModal(this.app, '🔓', decryptedText);
                    decryptModal.onClose = () => {
                        editor.focus();
                        if (decryptModal.decryptInPlace) {
                            editor.setSelection(selectionStart, selectionEnd);
                            editor.replaceSelection(decryptedText);
                        }
                    };
                    decryptModal.open();
                }
            }
        });
    }
    removeMarkers(text) {
        if (text.startsWith(_PREFIX_A) && text.endsWith(_SUFFIX)) {
            return text.replace(_PREFIX_A, '').replace(_SUFFIX, '');
        }
        if (text.startsWith(_PREFIX_OBSOLETE) && text.endsWith(_SUFFIX)) {
            return text.replace(_PREFIX_OBSOLETE, '').replace(_SUFFIX, '');
        }
        return text;
    }
    addMarkers(text) {
        if (!text.contains(_PREFIX_OBSOLETE) && !text.contains(_PREFIX_A) && !text.contains(_SUFFIX)) {
            return _PREFIX_A.concat(text, _SUFFIX);
        }
        return text;
    }
}

module.exports = MeldEncrypt;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWFpbi5qcyIsInNvdXJjZXMiOlsiLi4vbm9kZV9tb2R1bGVzL3RzbGliL3RzbGliLmVzNi5qcyIsIi4uL3NyYy9EZWNyeXB0TW9kYWwudHMiLCIuLi9zcmMvUGFzc3dvcmRNb2RhbC50cyIsIi4uL3NyYy9DcnlwdG9IZWxwZXIudHMiLCIuLi9zcmMvTWVsZEVuY3J5cHRTZXR0aW5nc1RhYi50cyIsIi4uL3NyYy9tYWluLnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8qISAqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKlxyXG5Db3B5cmlnaHQgKGMpIE1pY3Jvc29mdCBDb3Jwb3JhdGlvbi5cclxuXHJcblBlcm1pc3Npb24gdG8gdXNlLCBjb3B5LCBtb2RpZnksIGFuZC9vciBkaXN0cmlidXRlIHRoaXMgc29mdHdhcmUgZm9yIGFueVxyXG5wdXJwb3NlIHdpdGggb3Igd2l0aG91dCBmZWUgaXMgaGVyZWJ5IGdyYW50ZWQuXHJcblxyXG5USEUgU09GVFdBUkUgSVMgUFJPVklERUQgXCJBUyBJU1wiIEFORCBUSEUgQVVUSE9SIERJU0NMQUlNUyBBTEwgV0FSUkFOVElFUyBXSVRIXHJcblJFR0FSRCBUTyBUSElTIFNPRlRXQVJFIElOQ0xVRElORyBBTEwgSU1QTElFRCBXQVJSQU5USUVTIE9GIE1FUkNIQU5UQUJJTElUWVxyXG5BTkQgRklUTkVTUy4gSU4gTk8gRVZFTlQgU0hBTEwgVEhFIEFVVEhPUiBCRSBMSUFCTEUgRk9SIEFOWSBTUEVDSUFMLCBESVJFQ1QsXHJcbklORElSRUNULCBPUiBDT05TRVFVRU5USUFMIERBTUFHRVMgT1IgQU5ZIERBTUFHRVMgV0hBVFNPRVZFUiBSRVNVTFRJTkcgRlJPTVxyXG5MT1NTIE9GIFVTRSwgREFUQSBPUiBQUk9GSVRTLCBXSEVUSEVSIElOIEFOIEFDVElPTiBPRiBDT05UUkFDVCwgTkVHTElHRU5DRSBPUlxyXG5PVEhFUiBUT1JUSU9VUyBBQ1RJT04sIEFSSVNJTkcgT1VUIE9GIE9SIElOIENPTk5FQ1RJT04gV0lUSCBUSEUgVVNFIE9SXHJcblBFUkZPUk1BTkNFIE9GIFRISVMgU09GVFdBUkUuXHJcbioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqICovXHJcbi8qIGdsb2JhbCBSZWZsZWN0LCBQcm9taXNlICovXHJcblxyXG52YXIgZXh0ZW5kU3RhdGljcyA9IGZ1bmN0aW9uKGQsIGIpIHtcclxuICAgIGV4dGVuZFN0YXRpY3MgPSBPYmplY3Quc2V0UHJvdG90eXBlT2YgfHxcclxuICAgICAgICAoeyBfX3Byb3RvX186IFtdIH0gaW5zdGFuY2VvZiBBcnJheSAmJiBmdW5jdGlvbiAoZCwgYikgeyBkLl9fcHJvdG9fXyA9IGI7IH0pIHx8XHJcbiAgICAgICAgZnVuY3Rpb24gKGQsIGIpIHsgZm9yICh2YXIgcCBpbiBiKSBpZiAoT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKGIsIHApKSBkW3BdID0gYltwXTsgfTtcclxuICAgIHJldHVybiBleHRlbmRTdGF0aWNzKGQsIGIpO1xyXG59O1xyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIF9fZXh0ZW5kcyhkLCBiKSB7XHJcbiAgICBpZiAodHlwZW9mIGIgIT09IFwiZnVuY3Rpb25cIiAmJiBiICE9PSBudWxsKVxyXG4gICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoXCJDbGFzcyBleHRlbmRzIHZhbHVlIFwiICsgU3RyaW5nKGIpICsgXCIgaXMgbm90IGEgY29uc3RydWN0b3Igb3IgbnVsbFwiKTtcclxuICAgIGV4dGVuZFN0YXRpY3MoZCwgYik7XHJcbiAgICBmdW5jdGlvbiBfXygpIHsgdGhpcy5jb25zdHJ1Y3RvciA9IGQ7IH1cclxuICAgIGQucHJvdG90eXBlID0gYiA9PT0gbnVsbCA/IE9iamVjdC5jcmVhdGUoYikgOiAoX18ucHJvdG90eXBlID0gYi5wcm90b3R5cGUsIG5ldyBfXygpKTtcclxufVxyXG5cclxuZXhwb3J0IHZhciBfX2Fzc2lnbiA9IGZ1bmN0aW9uKCkge1xyXG4gICAgX19hc3NpZ24gPSBPYmplY3QuYXNzaWduIHx8IGZ1bmN0aW9uIF9fYXNzaWduKHQpIHtcclxuICAgICAgICBmb3IgKHZhciBzLCBpID0gMSwgbiA9IGFyZ3VtZW50cy5sZW5ndGg7IGkgPCBuOyBpKyspIHtcclxuICAgICAgICAgICAgcyA9IGFyZ3VtZW50c1tpXTtcclxuICAgICAgICAgICAgZm9yICh2YXIgcCBpbiBzKSBpZiAoT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKHMsIHApKSB0W3BdID0gc1twXTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIHQ7XHJcbiAgICB9XHJcbiAgICByZXR1cm4gX19hc3NpZ24uYXBwbHkodGhpcywgYXJndW1lbnRzKTtcclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIF9fcmVzdChzLCBlKSB7XHJcbiAgICB2YXIgdCA9IHt9O1xyXG4gICAgZm9yICh2YXIgcCBpbiBzKSBpZiAoT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKHMsIHApICYmIGUuaW5kZXhPZihwKSA8IDApXHJcbiAgICAgICAgdFtwXSA9IHNbcF07XHJcbiAgICBpZiAocyAhPSBudWxsICYmIHR5cGVvZiBPYmplY3QuZ2V0T3duUHJvcGVydHlTeW1ib2xzID09PSBcImZ1bmN0aW9uXCIpXHJcbiAgICAgICAgZm9yICh2YXIgaSA9IDAsIHAgPSBPYmplY3QuZ2V0T3duUHJvcGVydHlTeW1ib2xzKHMpOyBpIDwgcC5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgICAgICBpZiAoZS5pbmRleE9mKHBbaV0pIDwgMCAmJiBPYmplY3QucHJvdG90eXBlLnByb3BlcnR5SXNFbnVtZXJhYmxlLmNhbGwocywgcFtpXSkpXHJcbiAgICAgICAgICAgICAgICB0W3BbaV1dID0gc1twW2ldXTtcclxuICAgICAgICB9XHJcbiAgICByZXR1cm4gdDtcclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIF9fZGVjb3JhdGUoZGVjb3JhdG9ycywgdGFyZ2V0LCBrZXksIGRlc2MpIHtcclxuICAgIHZhciBjID0gYXJndW1lbnRzLmxlbmd0aCwgciA9IGMgPCAzID8gdGFyZ2V0IDogZGVzYyA9PT0gbnVsbCA/IGRlc2MgPSBPYmplY3QuZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yKHRhcmdldCwga2V5KSA6IGRlc2MsIGQ7XHJcbiAgICBpZiAodHlwZW9mIFJlZmxlY3QgPT09IFwib2JqZWN0XCIgJiYgdHlwZW9mIFJlZmxlY3QuZGVjb3JhdGUgPT09IFwiZnVuY3Rpb25cIikgciA9IFJlZmxlY3QuZGVjb3JhdGUoZGVjb3JhdG9ycywgdGFyZ2V0LCBrZXksIGRlc2MpO1xyXG4gICAgZWxzZSBmb3IgKHZhciBpID0gZGVjb3JhdG9ycy5sZW5ndGggLSAxOyBpID49IDA7IGktLSkgaWYgKGQgPSBkZWNvcmF0b3JzW2ldKSByID0gKGMgPCAzID8gZChyKSA6IGMgPiAzID8gZCh0YXJnZXQsIGtleSwgcikgOiBkKHRhcmdldCwga2V5KSkgfHwgcjtcclxuICAgIHJldHVybiBjID4gMyAmJiByICYmIE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0YXJnZXQsIGtleSwgciksIHI7XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBfX3BhcmFtKHBhcmFtSW5kZXgsIGRlY29yYXRvcikge1xyXG4gICAgcmV0dXJuIGZ1bmN0aW9uICh0YXJnZXQsIGtleSkgeyBkZWNvcmF0b3IodGFyZ2V0LCBrZXksIHBhcmFtSW5kZXgpOyB9XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBfX21ldGFkYXRhKG1ldGFkYXRhS2V5LCBtZXRhZGF0YVZhbHVlKSB7XHJcbiAgICBpZiAodHlwZW9mIFJlZmxlY3QgPT09IFwib2JqZWN0XCIgJiYgdHlwZW9mIFJlZmxlY3QubWV0YWRhdGEgPT09IFwiZnVuY3Rpb25cIikgcmV0dXJuIFJlZmxlY3QubWV0YWRhdGEobWV0YWRhdGFLZXksIG1ldGFkYXRhVmFsdWUpO1xyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gX19hd2FpdGVyKHRoaXNBcmcsIF9hcmd1bWVudHMsIFAsIGdlbmVyYXRvcikge1xyXG4gICAgZnVuY3Rpb24gYWRvcHQodmFsdWUpIHsgcmV0dXJuIHZhbHVlIGluc3RhbmNlb2YgUCA/IHZhbHVlIDogbmV3IFAoZnVuY3Rpb24gKHJlc29sdmUpIHsgcmVzb2x2ZSh2YWx1ZSk7IH0pOyB9XHJcbiAgICByZXR1cm4gbmV3IChQIHx8IChQID0gUHJvbWlzZSkpKGZ1bmN0aW9uIChyZXNvbHZlLCByZWplY3QpIHtcclxuICAgICAgICBmdW5jdGlvbiBmdWxmaWxsZWQodmFsdWUpIHsgdHJ5IHsgc3RlcChnZW5lcmF0b3IubmV4dCh2YWx1ZSkpOyB9IGNhdGNoIChlKSB7IHJlamVjdChlKTsgfSB9XHJcbiAgICAgICAgZnVuY3Rpb24gcmVqZWN0ZWQodmFsdWUpIHsgdHJ5IHsgc3RlcChnZW5lcmF0b3JbXCJ0aHJvd1wiXSh2YWx1ZSkpOyB9IGNhdGNoIChlKSB7IHJlamVjdChlKTsgfSB9XHJcbiAgICAgICAgZnVuY3Rpb24gc3RlcChyZXN1bHQpIHsgcmVzdWx0LmRvbmUgPyByZXNvbHZlKHJlc3VsdC52YWx1ZSkgOiBhZG9wdChyZXN1bHQudmFsdWUpLnRoZW4oZnVsZmlsbGVkLCByZWplY3RlZCk7IH1cclxuICAgICAgICBzdGVwKChnZW5lcmF0b3IgPSBnZW5lcmF0b3IuYXBwbHkodGhpc0FyZywgX2FyZ3VtZW50cyB8fCBbXSkpLm5leHQoKSk7XHJcbiAgICB9KTtcclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIF9fZ2VuZXJhdG9yKHRoaXNBcmcsIGJvZHkpIHtcclxuICAgIHZhciBfID0geyBsYWJlbDogMCwgc2VudDogZnVuY3Rpb24oKSB7IGlmICh0WzBdICYgMSkgdGhyb3cgdFsxXTsgcmV0dXJuIHRbMV07IH0sIHRyeXM6IFtdLCBvcHM6IFtdIH0sIGYsIHksIHQsIGc7XHJcbiAgICByZXR1cm4gZyA9IHsgbmV4dDogdmVyYigwKSwgXCJ0aHJvd1wiOiB2ZXJiKDEpLCBcInJldHVyblwiOiB2ZXJiKDIpIH0sIHR5cGVvZiBTeW1ib2wgPT09IFwiZnVuY3Rpb25cIiAmJiAoZ1tTeW1ib2wuaXRlcmF0b3JdID0gZnVuY3Rpb24oKSB7IHJldHVybiB0aGlzOyB9KSwgZztcclxuICAgIGZ1bmN0aW9uIHZlcmIobikgeyByZXR1cm4gZnVuY3Rpb24gKHYpIHsgcmV0dXJuIHN0ZXAoW24sIHZdKTsgfTsgfVxyXG4gICAgZnVuY3Rpb24gc3RlcChvcCkge1xyXG4gICAgICAgIGlmIChmKSB0aHJvdyBuZXcgVHlwZUVycm9yKFwiR2VuZXJhdG9yIGlzIGFscmVhZHkgZXhlY3V0aW5nLlwiKTtcclxuICAgICAgICB3aGlsZSAoXykgdHJ5IHtcclxuICAgICAgICAgICAgaWYgKGYgPSAxLCB5ICYmICh0ID0gb3BbMF0gJiAyID8geVtcInJldHVyblwiXSA6IG9wWzBdID8geVtcInRocm93XCJdIHx8ICgodCA9IHlbXCJyZXR1cm5cIl0pICYmIHQuY2FsbCh5KSwgMCkgOiB5Lm5leHQpICYmICEodCA9IHQuY2FsbCh5LCBvcFsxXSkpLmRvbmUpIHJldHVybiB0O1xyXG4gICAgICAgICAgICBpZiAoeSA9IDAsIHQpIG9wID0gW29wWzBdICYgMiwgdC52YWx1ZV07XHJcbiAgICAgICAgICAgIHN3aXRjaCAob3BbMF0pIHtcclxuICAgICAgICAgICAgICAgIGNhc2UgMDogY2FzZSAxOiB0ID0gb3A7IGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgY2FzZSA0OiBfLmxhYmVsKys7IHJldHVybiB7IHZhbHVlOiBvcFsxXSwgZG9uZTogZmFsc2UgfTtcclxuICAgICAgICAgICAgICAgIGNhc2UgNTogXy5sYWJlbCsrOyB5ID0gb3BbMV07IG9wID0gWzBdOyBjb250aW51ZTtcclxuICAgICAgICAgICAgICAgIGNhc2UgNzogb3AgPSBfLm9wcy5wb3AoKTsgXy50cnlzLnBvcCgpOyBjb250aW51ZTtcclxuICAgICAgICAgICAgICAgIGRlZmF1bHQ6XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKCEodCA9IF8udHJ5cywgdCA9IHQubGVuZ3RoID4gMCAmJiB0W3QubGVuZ3RoIC0gMV0pICYmIChvcFswXSA9PT0gNiB8fCBvcFswXSA9PT0gMikpIHsgXyA9IDA7IGNvbnRpbnVlOyB9XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKG9wWzBdID09PSAzICYmICghdCB8fCAob3BbMV0gPiB0WzBdICYmIG9wWzFdIDwgdFszXSkpKSB7IF8ubGFiZWwgPSBvcFsxXTsgYnJlYWs7IH1cclxuICAgICAgICAgICAgICAgICAgICBpZiAob3BbMF0gPT09IDYgJiYgXy5sYWJlbCA8IHRbMV0pIHsgXy5sYWJlbCA9IHRbMV07IHQgPSBvcDsgYnJlYWs7IH1cclxuICAgICAgICAgICAgICAgICAgICBpZiAodCAmJiBfLmxhYmVsIDwgdFsyXSkgeyBfLmxhYmVsID0gdFsyXTsgXy5vcHMucHVzaChvcCk7IGJyZWFrOyB9XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKHRbMl0pIF8ub3BzLnBvcCgpO1xyXG4gICAgICAgICAgICAgICAgICAgIF8udHJ5cy5wb3AoKTsgY29udGludWU7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgb3AgPSBib2R5LmNhbGwodGhpc0FyZywgXyk7XHJcbiAgICAgICAgfSBjYXRjaCAoZSkgeyBvcCA9IFs2LCBlXTsgeSA9IDA7IH0gZmluYWxseSB7IGYgPSB0ID0gMDsgfVxyXG4gICAgICAgIGlmIChvcFswXSAmIDUpIHRocm93IG9wWzFdOyByZXR1cm4geyB2YWx1ZTogb3BbMF0gPyBvcFsxXSA6IHZvaWQgMCwgZG9uZTogdHJ1ZSB9O1xyXG4gICAgfVxyXG59XHJcblxyXG5leHBvcnQgdmFyIF9fY3JlYXRlQmluZGluZyA9IE9iamVjdC5jcmVhdGUgPyAoZnVuY3Rpb24obywgbSwgaywgazIpIHtcclxuICAgIGlmIChrMiA9PT0gdW5kZWZpbmVkKSBrMiA9IGs7XHJcbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkobywgazIsIHsgZW51bWVyYWJsZTogdHJ1ZSwgZ2V0OiBmdW5jdGlvbigpIHsgcmV0dXJuIG1ba107IH0gfSk7XHJcbn0pIDogKGZ1bmN0aW9uKG8sIG0sIGssIGsyKSB7XHJcbiAgICBpZiAoazIgPT09IHVuZGVmaW5lZCkgazIgPSBrO1xyXG4gICAgb1trMl0gPSBtW2tdO1xyXG59KTtcclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBfX2V4cG9ydFN0YXIobSwgbykge1xyXG4gICAgZm9yICh2YXIgcCBpbiBtKSBpZiAocCAhPT0gXCJkZWZhdWx0XCIgJiYgIU9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChvLCBwKSkgX19jcmVhdGVCaW5kaW5nKG8sIG0sIHApO1xyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gX192YWx1ZXMobykge1xyXG4gICAgdmFyIHMgPSB0eXBlb2YgU3ltYm9sID09PSBcImZ1bmN0aW9uXCIgJiYgU3ltYm9sLml0ZXJhdG9yLCBtID0gcyAmJiBvW3NdLCBpID0gMDtcclxuICAgIGlmIChtKSByZXR1cm4gbS5jYWxsKG8pO1xyXG4gICAgaWYgKG8gJiYgdHlwZW9mIG8ubGVuZ3RoID09PSBcIm51bWJlclwiKSByZXR1cm4ge1xyXG4gICAgICAgIG5leHQ6IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgaWYgKG8gJiYgaSA+PSBvLmxlbmd0aCkgbyA9IHZvaWQgMDtcclxuICAgICAgICAgICAgcmV0dXJuIHsgdmFsdWU6IG8gJiYgb1tpKytdLCBkb25lOiAhbyB9O1xyXG4gICAgICAgIH1cclxuICAgIH07XHJcbiAgICB0aHJvdyBuZXcgVHlwZUVycm9yKHMgPyBcIk9iamVjdCBpcyBub3QgaXRlcmFibGUuXCIgOiBcIlN5bWJvbC5pdGVyYXRvciBpcyBub3QgZGVmaW5lZC5cIik7XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBfX3JlYWQobywgbikge1xyXG4gICAgdmFyIG0gPSB0eXBlb2YgU3ltYm9sID09PSBcImZ1bmN0aW9uXCIgJiYgb1tTeW1ib2wuaXRlcmF0b3JdO1xyXG4gICAgaWYgKCFtKSByZXR1cm4gbztcclxuICAgIHZhciBpID0gbS5jYWxsKG8pLCByLCBhciA9IFtdLCBlO1xyXG4gICAgdHJ5IHtcclxuICAgICAgICB3aGlsZSAoKG4gPT09IHZvaWQgMCB8fCBuLS0gPiAwKSAmJiAhKHIgPSBpLm5leHQoKSkuZG9uZSkgYXIucHVzaChyLnZhbHVlKTtcclxuICAgIH1cclxuICAgIGNhdGNoIChlcnJvcikgeyBlID0geyBlcnJvcjogZXJyb3IgfTsgfVxyXG4gICAgZmluYWxseSB7XHJcbiAgICAgICAgdHJ5IHtcclxuICAgICAgICAgICAgaWYgKHIgJiYgIXIuZG9uZSAmJiAobSA9IGlbXCJyZXR1cm5cIl0pKSBtLmNhbGwoaSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGZpbmFsbHkgeyBpZiAoZSkgdGhyb3cgZS5lcnJvcjsgfVxyXG4gICAgfVxyXG4gICAgcmV0dXJuIGFyO1xyXG59XHJcblxyXG4vKiogQGRlcHJlY2F0ZWQgKi9cclxuZXhwb3J0IGZ1bmN0aW9uIF9fc3ByZWFkKCkge1xyXG4gICAgZm9yICh2YXIgYXIgPSBbXSwgaSA9IDA7IGkgPCBhcmd1bWVudHMubGVuZ3RoOyBpKyspXHJcbiAgICAgICAgYXIgPSBhci5jb25jYXQoX19yZWFkKGFyZ3VtZW50c1tpXSkpO1xyXG4gICAgcmV0dXJuIGFyO1xyXG59XHJcblxyXG4vKiogQGRlcHJlY2F0ZWQgKi9cclxuZXhwb3J0IGZ1bmN0aW9uIF9fc3ByZWFkQXJyYXlzKCkge1xyXG4gICAgZm9yICh2YXIgcyA9IDAsIGkgPSAwLCBpbCA9IGFyZ3VtZW50cy5sZW5ndGg7IGkgPCBpbDsgaSsrKSBzICs9IGFyZ3VtZW50c1tpXS5sZW5ndGg7XHJcbiAgICBmb3IgKHZhciByID0gQXJyYXkocyksIGsgPSAwLCBpID0gMDsgaSA8IGlsOyBpKyspXHJcbiAgICAgICAgZm9yICh2YXIgYSA9IGFyZ3VtZW50c1tpXSwgaiA9IDAsIGpsID0gYS5sZW5ndGg7IGogPCBqbDsgaisrLCBrKyspXHJcbiAgICAgICAgICAgIHJba10gPSBhW2pdO1xyXG4gICAgcmV0dXJuIHI7XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBfX3NwcmVhZEFycmF5KHRvLCBmcm9tLCBwYWNrKSB7XHJcbiAgICBpZiAocGFjayB8fCBhcmd1bWVudHMubGVuZ3RoID09PSAyKSBmb3IgKHZhciBpID0gMCwgbCA9IGZyb20ubGVuZ3RoLCBhcjsgaSA8IGw7IGkrKykge1xyXG4gICAgICAgIGlmIChhciB8fCAhKGkgaW4gZnJvbSkpIHtcclxuICAgICAgICAgICAgaWYgKCFhcikgYXIgPSBBcnJheS5wcm90b3R5cGUuc2xpY2UuY2FsbChmcm9tLCAwLCBpKTtcclxuICAgICAgICAgICAgYXJbaV0gPSBmcm9tW2ldO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIHJldHVybiB0by5jb25jYXQoYXIgfHwgQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwoZnJvbSkpO1xyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gX19hd2FpdCh2KSB7XHJcbiAgICByZXR1cm4gdGhpcyBpbnN0YW5jZW9mIF9fYXdhaXQgPyAodGhpcy52ID0gdiwgdGhpcykgOiBuZXcgX19hd2FpdCh2KTtcclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIF9fYXN5bmNHZW5lcmF0b3IodGhpc0FyZywgX2FyZ3VtZW50cywgZ2VuZXJhdG9yKSB7XHJcbiAgICBpZiAoIVN5bWJvbC5hc3luY0l0ZXJhdG9yKSB0aHJvdyBuZXcgVHlwZUVycm9yKFwiU3ltYm9sLmFzeW5jSXRlcmF0b3IgaXMgbm90IGRlZmluZWQuXCIpO1xyXG4gICAgdmFyIGcgPSBnZW5lcmF0b3IuYXBwbHkodGhpc0FyZywgX2FyZ3VtZW50cyB8fCBbXSksIGksIHEgPSBbXTtcclxuICAgIHJldHVybiBpID0ge30sIHZlcmIoXCJuZXh0XCIpLCB2ZXJiKFwidGhyb3dcIiksIHZlcmIoXCJyZXR1cm5cIiksIGlbU3ltYm9sLmFzeW5jSXRlcmF0b3JdID0gZnVuY3Rpb24gKCkgeyByZXR1cm4gdGhpczsgfSwgaTtcclxuICAgIGZ1bmN0aW9uIHZlcmIobikgeyBpZiAoZ1tuXSkgaVtuXSA9IGZ1bmN0aW9uICh2KSB7IHJldHVybiBuZXcgUHJvbWlzZShmdW5jdGlvbiAoYSwgYikgeyBxLnB1c2goW24sIHYsIGEsIGJdKSA+IDEgfHwgcmVzdW1lKG4sIHYpOyB9KTsgfTsgfVxyXG4gICAgZnVuY3Rpb24gcmVzdW1lKG4sIHYpIHsgdHJ5IHsgc3RlcChnW25dKHYpKTsgfSBjYXRjaCAoZSkgeyBzZXR0bGUocVswXVszXSwgZSk7IH0gfVxyXG4gICAgZnVuY3Rpb24gc3RlcChyKSB7IHIudmFsdWUgaW5zdGFuY2VvZiBfX2F3YWl0ID8gUHJvbWlzZS5yZXNvbHZlKHIudmFsdWUudikudGhlbihmdWxmaWxsLCByZWplY3QpIDogc2V0dGxlKHFbMF1bMl0sIHIpOyB9XHJcbiAgICBmdW5jdGlvbiBmdWxmaWxsKHZhbHVlKSB7IHJlc3VtZShcIm5leHRcIiwgdmFsdWUpOyB9XHJcbiAgICBmdW5jdGlvbiByZWplY3QodmFsdWUpIHsgcmVzdW1lKFwidGhyb3dcIiwgdmFsdWUpOyB9XHJcbiAgICBmdW5jdGlvbiBzZXR0bGUoZiwgdikgeyBpZiAoZih2KSwgcS5zaGlmdCgpLCBxLmxlbmd0aCkgcmVzdW1lKHFbMF1bMF0sIHFbMF1bMV0pOyB9XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBfX2FzeW5jRGVsZWdhdG9yKG8pIHtcclxuICAgIHZhciBpLCBwO1xyXG4gICAgcmV0dXJuIGkgPSB7fSwgdmVyYihcIm5leHRcIiksIHZlcmIoXCJ0aHJvd1wiLCBmdW5jdGlvbiAoZSkgeyB0aHJvdyBlOyB9KSwgdmVyYihcInJldHVyblwiKSwgaVtTeW1ib2wuaXRlcmF0b3JdID0gZnVuY3Rpb24gKCkgeyByZXR1cm4gdGhpczsgfSwgaTtcclxuICAgIGZ1bmN0aW9uIHZlcmIobiwgZikgeyBpW25dID0gb1tuXSA/IGZ1bmN0aW9uICh2KSB7IHJldHVybiAocCA9ICFwKSA/IHsgdmFsdWU6IF9fYXdhaXQob1tuXSh2KSksIGRvbmU6IG4gPT09IFwicmV0dXJuXCIgfSA6IGYgPyBmKHYpIDogdjsgfSA6IGY7IH1cclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIF9fYXN5bmNWYWx1ZXMobykge1xyXG4gICAgaWYgKCFTeW1ib2wuYXN5bmNJdGVyYXRvcikgdGhyb3cgbmV3IFR5cGVFcnJvcihcIlN5bWJvbC5hc3luY0l0ZXJhdG9yIGlzIG5vdCBkZWZpbmVkLlwiKTtcclxuICAgIHZhciBtID0gb1tTeW1ib2wuYXN5bmNJdGVyYXRvcl0sIGk7XHJcbiAgICByZXR1cm4gbSA/IG0uY2FsbChvKSA6IChvID0gdHlwZW9mIF9fdmFsdWVzID09PSBcImZ1bmN0aW9uXCIgPyBfX3ZhbHVlcyhvKSA6IG9bU3ltYm9sLml0ZXJhdG9yXSgpLCBpID0ge30sIHZlcmIoXCJuZXh0XCIpLCB2ZXJiKFwidGhyb3dcIiksIHZlcmIoXCJyZXR1cm5cIiksIGlbU3ltYm9sLmFzeW5jSXRlcmF0b3JdID0gZnVuY3Rpb24gKCkgeyByZXR1cm4gdGhpczsgfSwgaSk7XHJcbiAgICBmdW5jdGlvbiB2ZXJiKG4pIHsgaVtuXSA9IG9bbl0gJiYgZnVuY3Rpb24gKHYpIHsgcmV0dXJuIG5ldyBQcm9taXNlKGZ1bmN0aW9uIChyZXNvbHZlLCByZWplY3QpIHsgdiA9IG9bbl0odiksIHNldHRsZShyZXNvbHZlLCByZWplY3QsIHYuZG9uZSwgdi52YWx1ZSk7IH0pOyB9OyB9XHJcbiAgICBmdW5jdGlvbiBzZXR0bGUocmVzb2x2ZSwgcmVqZWN0LCBkLCB2KSB7IFByb21pc2UucmVzb2x2ZSh2KS50aGVuKGZ1bmN0aW9uKHYpIHsgcmVzb2x2ZSh7IHZhbHVlOiB2LCBkb25lOiBkIH0pOyB9LCByZWplY3QpOyB9XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBfX21ha2VUZW1wbGF0ZU9iamVjdChjb29rZWQsIHJhdykge1xyXG4gICAgaWYgKE9iamVjdC5kZWZpbmVQcm9wZXJ0eSkgeyBPYmplY3QuZGVmaW5lUHJvcGVydHkoY29va2VkLCBcInJhd1wiLCB7IHZhbHVlOiByYXcgfSk7IH0gZWxzZSB7IGNvb2tlZC5yYXcgPSByYXc7IH1cclxuICAgIHJldHVybiBjb29rZWQ7XHJcbn07XHJcblxyXG52YXIgX19zZXRNb2R1bGVEZWZhdWx0ID0gT2JqZWN0LmNyZWF0ZSA/IChmdW5jdGlvbihvLCB2KSB7XHJcbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkobywgXCJkZWZhdWx0XCIsIHsgZW51bWVyYWJsZTogdHJ1ZSwgdmFsdWU6IHYgfSk7XHJcbn0pIDogZnVuY3Rpb24obywgdikge1xyXG4gICAgb1tcImRlZmF1bHRcIl0gPSB2O1xyXG59O1xyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIF9faW1wb3J0U3Rhcihtb2QpIHtcclxuICAgIGlmIChtb2QgJiYgbW9kLl9fZXNNb2R1bGUpIHJldHVybiBtb2Q7XHJcbiAgICB2YXIgcmVzdWx0ID0ge307XHJcbiAgICBpZiAobW9kICE9IG51bGwpIGZvciAodmFyIGsgaW4gbW9kKSBpZiAoayAhPT0gXCJkZWZhdWx0XCIgJiYgT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKG1vZCwgaykpIF9fY3JlYXRlQmluZGluZyhyZXN1bHQsIG1vZCwgayk7XHJcbiAgICBfX3NldE1vZHVsZURlZmF1bHQocmVzdWx0LCBtb2QpO1xyXG4gICAgcmV0dXJuIHJlc3VsdDtcclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIF9faW1wb3J0RGVmYXVsdChtb2QpIHtcclxuICAgIHJldHVybiAobW9kICYmIG1vZC5fX2VzTW9kdWxlKSA/IG1vZCA6IHsgZGVmYXVsdDogbW9kIH07XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBfX2NsYXNzUHJpdmF0ZUZpZWxkR2V0KHJlY2VpdmVyLCBzdGF0ZSwga2luZCwgZikge1xyXG4gICAgaWYgKGtpbmQgPT09IFwiYVwiICYmICFmKSB0aHJvdyBuZXcgVHlwZUVycm9yKFwiUHJpdmF0ZSBhY2Nlc3NvciB3YXMgZGVmaW5lZCB3aXRob3V0IGEgZ2V0dGVyXCIpO1xyXG4gICAgaWYgKHR5cGVvZiBzdGF0ZSA9PT0gXCJmdW5jdGlvblwiID8gcmVjZWl2ZXIgIT09IHN0YXRlIHx8ICFmIDogIXN0YXRlLmhhcyhyZWNlaXZlcikpIHRocm93IG5ldyBUeXBlRXJyb3IoXCJDYW5ub3QgcmVhZCBwcml2YXRlIG1lbWJlciBmcm9tIGFuIG9iamVjdCB3aG9zZSBjbGFzcyBkaWQgbm90IGRlY2xhcmUgaXRcIik7XHJcbiAgICByZXR1cm4ga2luZCA9PT0gXCJtXCIgPyBmIDoga2luZCA9PT0gXCJhXCIgPyBmLmNhbGwocmVjZWl2ZXIpIDogZiA/IGYudmFsdWUgOiBzdGF0ZS5nZXQocmVjZWl2ZXIpO1xyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gX19jbGFzc1ByaXZhdGVGaWVsZFNldChyZWNlaXZlciwgc3RhdGUsIHZhbHVlLCBraW5kLCBmKSB7XHJcbiAgICBpZiAoa2luZCA9PT0gXCJtXCIpIHRocm93IG5ldyBUeXBlRXJyb3IoXCJQcml2YXRlIG1ldGhvZCBpcyBub3Qgd3JpdGFibGVcIik7XHJcbiAgICBpZiAoa2luZCA9PT0gXCJhXCIgJiYgIWYpIHRocm93IG5ldyBUeXBlRXJyb3IoXCJQcml2YXRlIGFjY2Vzc29yIHdhcyBkZWZpbmVkIHdpdGhvdXQgYSBzZXR0ZXJcIik7XHJcbiAgICBpZiAodHlwZW9mIHN0YXRlID09PSBcImZ1bmN0aW9uXCIgPyByZWNlaXZlciAhPT0gc3RhdGUgfHwgIWYgOiAhc3RhdGUuaGFzKHJlY2VpdmVyKSkgdGhyb3cgbmV3IFR5cGVFcnJvcihcIkNhbm5vdCB3cml0ZSBwcml2YXRlIG1lbWJlciB0byBhbiBvYmplY3Qgd2hvc2UgY2xhc3MgZGlkIG5vdCBkZWNsYXJlIGl0XCIpO1xyXG4gICAgcmV0dXJuIChraW5kID09PSBcImFcIiA/IGYuY2FsbChyZWNlaXZlciwgdmFsdWUpIDogZiA/IGYudmFsdWUgPSB2YWx1ZSA6IHN0YXRlLnNldChyZWNlaXZlciwgdmFsdWUpKSwgdmFsdWU7XHJcbn1cclxuIiwiaW1wb3J0IHsgQXBwLCBNb2RhbCB9IGZyb20gJ29ic2lkaWFuJztcclxuXHJcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIERlY3J5cHRNb2RhbCBleHRlbmRzIE1vZGFsIHtcclxuXHR0ZXh0OiBzdHJpbmc7XHJcblx0ZGVjcnlwdEluUGxhY2U6IGJvb2xlYW4gPSBmYWxzZTtcclxuXHJcblx0Y29uc3RydWN0b3IoYXBwOiBBcHAsIHRpdGxlOiBzdHJpbmcsIHRleHQ6IHN0cmluZyA9ICcnKSB7XHJcblx0XHRzdXBlcihhcHApO1xyXG5cdFx0dGhpcy50ZXh0ID0gdGV4dDtcclxuXHRcdHRoaXMudGl0bGVFbC5pbm5lclRleHQgPSB0aXRsZTtcclxuXHR9XHJcblxyXG5cdG9uT3BlbigpIHtcclxuXHRcdGxldCB7IGNvbnRlbnRFbCB9ID0gdGhpcztcclxuXHJcblx0XHRjb25zdCB0ZXh0RWwgPSBjb250ZW50RWwuY3JlYXRlRGl2KCkuY3JlYXRlRWwoJ3RleHRhcmVhJywgeyB0ZXh0OiB0aGlzLnRleHQgfSk7XHJcblx0XHR0ZXh0RWwuc3R5bGUud2lkdGggPSAnMTAwJSc7XHJcblx0XHR0ZXh0RWwuc3R5bGUuaGVpZ2h0ID0gJzEwMCUnO1xyXG5cdFx0dGV4dEVsLnJvd3MgPSAxMDtcclxuXHRcdHRleHRFbC5yZWFkT25seSA9IHRydWU7XHJcblx0XHQvL3RleHRFbC5mb2N1cygpOyAvLyBEb2Vzbid0IHNlZW0gdG8gd29yayBoZXJlLi4uXHJcblx0XHRzZXRUaW1lb3V0KCgpID0+IHsgdGV4dEVsLmZvY3VzKCkgfSwxMDApOyAvLy4uLiBidXQgdGhpcyBkb2VzXHJcblxyXG5cclxuXHRcdGNvbnN0IGJ0bkNvbnRhaW5lckVsID0gY29udGVudEVsLmNyZWF0ZURpdignJyk7XHJcblxyXG5cdFx0Y29uc3QgZGVjcnlwdEluUGxhY2VCdG5FbCA9IGJ0bkNvbnRhaW5lckVsLmNyZWF0ZUVsKCdidXR0b24nLCB7IHRleHQ6ICdEZWNyeXB0IGluLXBsYWNlJyB9KTtcclxuXHRcdGRlY3J5cHRJblBsYWNlQnRuRWwuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoKSA9PiB7XHJcblx0XHRcdHRoaXMuZGVjcnlwdEluUGxhY2UgPSB0cnVlO1xyXG5cdFx0XHR0aGlzLmNsb3NlKCk7XHJcblx0XHR9KTtcclxuXHJcblx0XHRjb25zdCBjYW5jZWxCdG5FbCA9IGJ0bkNvbnRhaW5lckVsLmNyZWF0ZUVsKCdidXR0b24nLCB7IHRleHQ6ICdDbG9zZScgfSk7XHJcblx0XHRjYW5jZWxCdG5FbC5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsICgpID0+IHtcclxuXHRcdFx0dGhpcy5jbG9zZSgpO1xyXG5cdFx0fSk7XHJcblxyXG5cdH1cclxuXHJcbn0iLCJpbXBvcnQgeyBBcHAsIE1vZGFsIH0gZnJvbSAnb2JzaWRpYW4nO1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgUGFzc3dvcmRNb2RhbCBleHRlbmRzIE1vZGFsIHtcclxuXHRwYXNzd29yZDogc3RyaW5nID0gbnVsbDtcclxuXHRkZWZhdWx0UGFzc3dvcmQ6IHN0cmluZyA9IG51bGw7XHJcblx0Y29uZmlybVBhc3N3b3JkOiBib29sZWFuO1xyXG5cclxuXHRjb25zdHJ1Y3RvcihhcHA6IEFwcCwgY29uZmlybVBhc3N3b3JkOiBib29sZWFuLCBkZWZhdWx0UGFzc3dvcmQ6IHN0cmluZyA9IG51bGwpIHtcclxuXHRcdHN1cGVyKGFwcCk7XHJcblx0XHR0aGlzLmRlZmF1bHRQYXNzd29yZCA9IGRlZmF1bHRQYXNzd29yZDtcclxuXHRcdHRoaXMuY29uZmlybVBhc3N3b3JkID0gY29uZmlybVBhc3N3b3JkO1xyXG5cdH1cclxuXHJcblx0b25PcGVuKCkge1xyXG5cdFx0bGV0IHsgY29udGVudEVsIH0gPSB0aGlzO1xyXG5cclxuXHRcdGNvbnRlbnRFbC5lbXB0eSgpO1xyXG5cclxuXHRcdGNvbnN0IGlucHV0UHdDb250YWluZXJFbCA9IGNvbnRlbnRFbC5jcmVhdGVEaXYoKTtcclxuXHRcdGlucHV0UHdDb250YWluZXJFbC5jcmVhdGVTcGFuKHsgdGV4dDogJ/CflJEgJyB9KTtcclxuXHRcdFxyXG5cdFx0Y29uc3QgcHdJbnB1dEVsID0gaW5wdXRQd0NvbnRhaW5lckVsLmNyZWF0ZUVsKCdpbnB1dCcsIHsgdHlwZTogJ3Bhc3N3b3JkJywgdmFsdWU6IHRoaXMuZGVmYXVsdFBhc3N3b3JkID8/ICcnIH0pO1xyXG5cdFx0cHdJbnB1dEVsLnBsYWNlaG9sZGVyID0gJ0VudGVyIHlvdXIgcGFzc3dvcmQnO1xyXG5cdFx0cHdJbnB1dEVsLnN0eWxlLndpZHRoID0gJzcwJSc7XHJcblx0XHRwd0lucHV0RWwuZm9jdXMoKTtcclxuXHJcblx0XHRjb25zdCBpbnB1dElucHV0TmV4dEJ0bkVsID0gaW5wdXRQd0NvbnRhaW5lckVsLmNyZWF0ZUVsKCdidXR0b24nLCB7IHRleHQ6ICfihpInIH0pO1xyXG5cdFx0aW5wdXRJbnB1dE5leHRCdG5FbC5zdHlsZS5kaXNwbGF5ID0gJ2lubGluZSc7XHJcblx0XHRpbnB1dElucHV0TmV4dEJ0bkVsLnN0eWxlLm1hcmdpbkxlZnQgPSBcIjFlbVwiO1xyXG5cdFx0aW5wdXRJbnB1dE5leHRCdG5FbC5zdHlsZS53aWR0aCA9IFwiNGVtXCI7XHJcblx0XHRpbnB1dElucHV0TmV4dEJ0bkVsLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKGV2KSA9PiB7XHJcblx0XHRcdGlucHV0UGFzc3dvcmRIYW5kbGVyKCk7XHJcblx0XHR9KTtcclxuXHJcblxyXG5cdFx0Y29uc3QgY29uZmlybVB3Q29udGFpbmVyRWwgPSBjb250ZW50RWwuY3JlYXRlRGl2KCk7XHJcblx0XHRjb25maXJtUHdDb250YWluZXJFbC5zdHlsZS5tYXJnaW5Ub3AgPSAnMWVtJztcclxuXHRcdGNvbmZpcm1Qd0NvbnRhaW5lckVsLmNyZWF0ZVNwYW4oeyB0ZXh0OiAn8J+UkSAnIH0pO1xyXG5cdFx0XHJcblx0XHRjb25zdCBwd0NvbmZpcm1JbnB1dEVsID0gY29uZmlybVB3Q29udGFpbmVyRWwuY3JlYXRlRWwoJ2lucHV0JywgeyB0eXBlOiAncGFzc3dvcmQnLCB2YWx1ZTogdGhpcy5kZWZhdWx0UGFzc3dvcmQgPz8gJycgfSk7XHJcblx0XHRwd0NvbmZpcm1JbnB1dEVsLnBsYWNlaG9sZGVyID0gJ0NvbmZpcm0geW91ciBwYXNzd29yZCc7XHJcblx0XHRwd0NvbmZpcm1JbnB1dEVsLnN0eWxlLndpZHRoID0gJzcwJSc7XHJcblxyXG5cdFx0Y29uc3QgY29uZmlybUlucHV0TmV4dEJ0bkVsID0gY29uZmlybVB3Q29udGFpbmVyRWwuY3JlYXRlRWwoJ2J1dHRvbicsIHsgdGV4dDogJ+KGkicgfSk7XHJcblx0XHRjb25maXJtSW5wdXROZXh0QnRuRWwuc3R5bGUuZGlzcGxheSA9ICdpbmxpbmUnO1xyXG5cdFx0Y29uZmlybUlucHV0TmV4dEJ0bkVsLnN0eWxlLm1hcmdpbkxlZnQgPSBcIjFlbVwiO1xyXG5cdFx0Y29uZmlybUlucHV0TmV4dEJ0bkVsLnN0eWxlLndpZHRoID0gXCI0ZW1cIjtcclxuXHRcdGNvbmZpcm1JbnB1dE5leHRCdG5FbC5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIChldikgPT4ge1xyXG5cdFx0XHRjb25maXJtUGFzc3dvcmRIYW5kbGVyKCk7XHJcblx0XHR9KTtcclxuXHRcdFxyXG5cdFx0Y29uc3QgaW5wdXRQYXNzd29yZEhhbmRsZXIgPSAoKSA9PntcclxuXHRcdFx0aWYgKHRoaXMuY29uZmlybVBhc3N3b3JkKSB7XHJcblx0XHRcdFx0Ly8gY29uZmltIHBhc3N3b3JkXHJcblx0XHRcdFx0cHdDb25maXJtSW5wdXRFbC5mb2N1cygpO1xyXG5cdFx0XHR9IGVsc2Uge1xyXG5cdFx0XHRcdHRoaXMucGFzc3dvcmQgPSBwd0lucHV0RWwudmFsdWU7XHJcblx0XHRcdFx0dGhpcy5jbG9zZSgpO1xyXG5cdFx0XHR9XHJcblx0XHR9XHJcblxyXG5cdFx0Y29uc3QgY29uZmlybVBhc3N3b3JkSGFuZGxlciA9ICgpID0+IHtcclxuXHRcdFx0aWYgKHB3SW5wdXRFbC52YWx1ZSA9PSBwd0NvbmZpcm1JbnB1dEVsLnZhbHVlKXtcclxuXHRcdFx0XHR0aGlzLnBhc3N3b3JkID0gcHdDb25maXJtSW5wdXRFbC52YWx1ZTtcclxuXHRcdFx0XHR0aGlzLmNsb3NlKCk7XHJcblx0XHRcdH1lbHNle1xyXG5cdFx0XHRcdC8vIHBhc3N3b3JkcyBkb24ndCBtYXRjaFxyXG5cdFx0XHRcdG1lc3NhZ2VFbC5zZXRUZXh0KCdQYXNzd29yZHMgZG9uXFwndCBtYXRjaCcpO1xyXG5cdFx0XHRcdG1lc3NhZ2VFbC5zaG93KCk7XHJcblx0XHRcdH1cclxuXHRcdH1cclxuXHJcblxyXG5cdFx0cHdDb25maXJtSW5wdXRFbC5hZGRFdmVudExpc3RlbmVyKCdrZXlwcmVzcycsIChldikgPT4ge1xyXG5cdFx0XHRpZiAoXHJcblx0XHRcdFx0KCBldi5jb2RlID09PSAnRW50ZXInIHx8IGV2LmNvZGUgPT09ICdOdW1wYWRFbnRlcicgKVxyXG5cdFx0XHRcdCYmIHB3Q29uZmlybUlucHV0RWwudmFsdWUubGVuZ3RoID4gMFxyXG5cdFx0XHQpIHtcclxuXHRcdFx0XHRldi5wcmV2ZW50RGVmYXVsdCgpO1xyXG5cdFx0XHRcdGNvbmZpcm1QYXNzd29yZEhhbmRsZXIoKTtcclxuXHRcdFx0fVxyXG5cdFx0fSk7XHJcblx0XHRcclxuXHJcblx0XHRpZiAoIXRoaXMuY29uZmlybVBhc3N3b3JkKSB7XHJcblx0XHRcdGNvbmZpcm1Qd0NvbnRhaW5lckVsLmhpZGUoKTtcclxuXHRcdH1cclxuXHJcblx0XHRjb25zdCBtZXNzYWdlRWwgPSBjb250ZW50RWwuY3JlYXRlRGl2KCk7XHJcblx0XHRtZXNzYWdlRWwuc3R5bGUubWFyZ2luVG9wID0gJzFlbSc7XHJcblx0XHRtZXNzYWdlRWwuaGlkZSgpO1xyXG5cclxuXHRcdHB3SW5wdXRFbC5hZGRFdmVudExpc3RlbmVyKCdrZXlwcmVzcycsIChldikgPT4ge1xyXG5cdFx0XHRpZiAoXHJcblx0XHRcdFx0KCBldi5jb2RlID09PSAnRW50ZXInIHx8IGV2LmNvZGUgPT09ICdOdW1wYWRFbnRlcicgKVxyXG5cdFx0XHRcdCYmIHB3SW5wdXRFbC52YWx1ZS5sZW5ndGggPiAwXHJcblx0XHRcdCkge1xyXG5cdFx0XHRcdGV2LnByZXZlbnREZWZhdWx0KCk7XHJcblx0XHRcdFx0aW5wdXRQYXNzd29yZEhhbmRsZXIoKTtcclxuXHRcdFx0fVxyXG5cdFx0fSk7XHJcblxyXG5cdFx0Ly8gY29uc3QgYnRuQ29udGFpbmVyRWwgPSBjb250ZW50RWwuY3JlYXRlRGl2KCcnKTtcclxuXHRcdC8vIGJ0bkNvbnRhaW5lckVsLnN0eWxlLm1hcmdpblRvcCA9ICcxZW0nO1xyXG5cclxuXHRcdC8vIGNvbnN0IG9rQnRuRWwgPSBidG5Db250YWluZXJFbC5jcmVhdGVFbCgnYnV0dG9uJywgeyB0ZXh0OiAnT0snIH0pO1xyXG5cdFx0Ly8gb2tCdG5FbC5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsICgpID0+IHtcclxuXHRcdC8vIFx0dGhpcy5wYXNzd29yZCA9IHB3SW5wdXRFbC52YWx1ZTtcclxuXHRcdC8vIFx0dGhpcy5jbG9zZSgpO1xyXG5cdFx0Ly8gfSk7XHJcblxyXG5cdFx0Ly8gY29uc3QgY2FuY2VsQnRuRWwgPSBidG5Db250YWluZXJFbC5jcmVhdGVFbCgnYnV0dG9uJywgeyB0ZXh0OiAnQ2FuY2VsJyB9KTtcclxuXHRcdC8vIGNhbmNlbEJ0bkVsLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKCkgPT4ge1xyXG5cdFx0Ly8gXHR0aGlzLmNsb3NlKCk7XHJcblx0XHQvLyB9KTtcclxuXHJcblxyXG5cdH1cclxuXHJcbn0iLCJjb25zdCB2ZWN0b3JTaXplXHQ9IDE2O1xyXG5jb25zdCB1dGY4RW5jb2Rlclx0PSBuZXcgVGV4dEVuY29kZXIoKTtcclxuY29uc3QgdXRmOERlY29kZXJcdD0gbmV3IFRleHREZWNvZGVyKCk7XHJcbmNvbnN0IGl0ZXJhdGlvbnNcdD0gMTAwMDtcclxuY29uc3Qgc2FsdFx0XHRcdD0gdXRmOEVuY29kZXIuZW5jb2RlKCdYSFduREFUNmVoTVZZMnpEJyk7XHJcblxyXG5leHBvcnQgY2xhc3MgQ3J5cHRvSGVscGVyVjIge1xyXG5cclxuXHRwcml2YXRlIGFzeW5jIGRlcml2ZUtleShwYXNzd29yZDpzdHJpbmcpIDpQcm9taXNlPENyeXB0b0tleT4ge1xyXG5cdFx0Y29uc3QgYnVmZmVyICAgICA9IHV0ZjhFbmNvZGVyLmVuY29kZShwYXNzd29yZCk7XHJcblx0XHRjb25zdCBrZXkgICAgICAgID0gYXdhaXQgY3J5cHRvLnN1YnRsZS5pbXBvcnRLZXkoJ3JhdycsIGJ1ZmZlciwge25hbWU6ICdQQktERjInfSwgZmFsc2UsIFsnZGVyaXZlS2V5J10pO1xyXG5cdFx0Y29uc3QgcHJpdmF0ZUtleSA9IGNyeXB0by5zdWJ0bGUuZGVyaXZlS2V5KFxyXG5cdFx0XHR7XHJcblx0XHRcdFx0bmFtZTogJ1BCS0RGMicsXHJcblx0XHRcdFx0aGFzaDoge25hbWU6ICdTSEEtMjU2J30sXHJcblx0XHRcdFx0aXRlcmF0aW9ucyxcclxuXHRcdFx0XHRzYWx0XHJcblx0XHRcdH0sXHJcblx0XHRcdGtleSxcclxuXHRcdFx0e1xyXG5cdFx0XHRcdG5hbWU6ICdBRVMtR0NNJyxcclxuXHRcdFx0XHRsZW5ndGg6IDI1NlxyXG5cdFx0XHR9LFxyXG5cdFx0XHRmYWxzZSxcclxuXHRcdFx0WydlbmNyeXB0JywgJ2RlY3J5cHQnXVxyXG5cdFx0KTtcclxuXHRcdFxyXG5cdFx0cmV0dXJuIHByaXZhdGVLZXk7XHJcblx0fVxyXG5cclxuXHRwdWJsaWMgYXN5bmMgZW5jcnlwdFRvQmFzZTY0KHRleHQ6IHN0cmluZywgcGFzc3dvcmQ6IHN0cmluZyk6IFByb21pc2U8c3RyaW5nPiB7XHJcblxyXG5cdFx0Y29uc3Qga2V5ID0gYXdhaXQgdGhpcy5kZXJpdmVLZXkocGFzc3dvcmQpO1xyXG5cdFx0XHJcblx0XHRjb25zdCB0ZXh0Qnl0ZXNUb0VuY3J5cHQgPSB1dGY4RW5jb2Rlci5lbmNvZGUodGV4dCk7XHJcblx0XHRjb25zdCB2ZWN0b3IgPSBjcnlwdG8uZ2V0UmFuZG9tVmFsdWVzKG5ldyBVaW50OEFycmF5KHZlY3RvclNpemUpKTtcclxuXHRcdFxyXG5cdFx0Ly8gZW5jcnlwdCBpbnRvIGJ5dGVzXHJcblx0XHRjb25zdCBlbmNyeXB0ZWRCeXRlcyA9IG5ldyBVaW50OEFycmF5KFxyXG5cdFx0XHRhd2FpdCBjcnlwdG8uc3VidGxlLmVuY3J5cHQoXHJcblx0XHRcdFx0e25hbWU6ICdBRVMtR0NNJywgaXY6IHZlY3Rvcn0sXHJcblx0XHRcdFx0a2V5LFxyXG5cdFx0XHRcdHRleHRCeXRlc1RvRW5jcnlwdFxyXG5cdFx0XHQpXHJcblx0XHQpO1xyXG5cdFx0XHJcblx0XHRjb25zdCBmaW5hbEJ5dGVzID0gbmV3IFVpbnQ4QXJyYXkoIHZlY3Rvci5ieXRlTGVuZ3RoICsgZW5jcnlwdGVkQnl0ZXMuYnl0ZUxlbmd0aCApO1xyXG5cdFx0ZmluYWxCeXRlcy5zZXQoIHZlY3RvciwgMCApO1xyXG5cdFx0ZmluYWxCeXRlcy5zZXQoIGVuY3J5cHRlZEJ5dGVzLCB2ZWN0b3IuYnl0ZUxlbmd0aCApO1xyXG5cclxuXHRcdC8vY29udmVydCBhcnJheSB0byBiYXNlNjRcclxuXHRcdGNvbnN0IGJhc2U2NFRleHQgPSBidG9hKCBTdHJpbmcuZnJvbUNoYXJDb2RlKC4uLmZpbmFsQnl0ZXMpICk7XHJcblxyXG5cdFx0cmV0dXJuIGJhc2U2NFRleHQ7XHJcblx0fVxyXG5cclxuXHRwcml2YXRlIHN0cmluZ1RvQXJyYXkoc3RyOiBzdHJpbmcpOiBVaW50OEFycmF5IHtcclxuXHRcdHZhciByZXN1bHQgPSBbXTtcclxuXHRcdGZvciAodmFyIGkgPSAwOyBpIDwgc3RyLmxlbmd0aDsgaSsrKSB7XHJcblx0XHRcdHJlc3VsdC5wdXNoKHN0ci5jaGFyQ29kZUF0KGkpKTtcclxuXHRcdH1cclxuXHRcdHJldHVybiBuZXcgVWludDhBcnJheShyZXN1bHQpO1xyXG5cdH1cclxuXHJcblx0cHVibGljIGFzeW5jIGRlY3J5cHRGcm9tQmFzZTY0KGJhc2U2NEVuY29kZWQ6IHN0cmluZywgcGFzc3dvcmQ6IHN0cmluZyk6IFByb21pc2U8c3RyaW5nPiB7XHJcblx0XHR0cnkge1xyXG5cclxuXHRcdFx0bGV0IGJ5dGVzVG9EZWNvZGUgPSB0aGlzLnN0cmluZ1RvQXJyYXkoYXRvYihiYXNlNjRFbmNvZGVkKSk7XHJcblx0XHRcdFxyXG5cdFx0XHQvLyBleHRyYWN0IGl2XHJcblx0XHRcdGNvbnN0IHZlY3RvciA9IGJ5dGVzVG9EZWNvZGUuc2xpY2UoMCx2ZWN0b3JTaXplKTtcclxuXHJcblx0XHRcdC8vIGV4dHJhY3QgZW5jcnlwdGVkIHRleHRcclxuXHRcdFx0Y29uc3QgZW5jcnlwdGVkVGV4dEJ5dGVzID0gYnl0ZXNUb0RlY29kZS5zbGljZSh2ZWN0b3JTaXplKTtcclxuXHJcblx0XHRcdGNvbnN0IGtleSA9IGF3YWl0IHRoaXMuZGVyaXZlS2V5KHBhc3N3b3JkKTtcclxuXHJcblx0XHRcdC8vIGRlY3J5cHQgaW50byBieXRlc1xyXG5cdFx0XHRsZXQgZGVjcnlwdGVkQnl0ZXMgPSBhd2FpdCBjcnlwdG8uc3VidGxlLmRlY3J5cHQoXHJcblx0XHRcdFx0e25hbWU6ICdBRVMtR0NNJywgaXY6IHZlY3Rvcn0sXHJcblx0XHRcdFx0a2V5LFxyXG5cdFx0XHRcdGVuY3J5cHRlZFRleHRCeXRlc1xyXG5cdFx0XHQpO1xyXG5cclxuXHRcdFx0Ly8gY29udmVydCBieXRlcyB0byB0ZXh0XHJcblx0XHRcdGxldCBkZWNyeXB0ZWRUZXh0ID0gdXRmOERlY29kZXIuZGVjb2RlKGRlY3J5cHRlZEJ5dGVzKTtcclxuXHRcdFx0cmV0dXJuIGRlY3J5cHRlZFRleHQ7XHJcblx0XHR9IGNhdGNoIChlKSB7XHJcblx0XHRcdC8vY29uc29sZS5lcnJvcihlKTtcclxuXHRcdFx0cmV0dXJuIG51bGw7XHJcblx0XHR9XHJcblx0fVxyXG5cclxufVxyXG5cclxuY29uc3QgYWxnb3JpdGhtT2Jzb2xldGUgPSB7XHJcblx0bmFtZTogJ0FFUy1HQ00nLFxyXG5cdGl2OiBuZXcgVWludDhBcnJheShbMTk2LCAxOTAsIDI0MCwgMTkwLCAxODgsIDc4LCA0MSwgMTMyLCAxNSwgMjIwLCA4NCwgMjExXSksXHJcblx0dGFnTGVuZ3RoOiAxMjhcclxufVxyXG5cclxuZXhwb3J0IGNsYXNzIENyeXB0b0hlbHBlck9ic29sZXRlIHtcclxuXHJcblx0cHJpdmF0ZSBhc3luYyBidWlsZEtleShwYXNzd29yZDogc3RyaW5nKSB7XHJcblx0XHRsZXQgdXRmOEVuY29kZSA9IG5ldyBUZXh0RW5jb2RlcigpO1xyXG5cdFx0bGV0IHBhc3N3b3JkQnl0ZXMgPSB1dGY4RW5jb2RlLmVuY29kZShwYXNzd29yZCk7XHJcblxyXG5cdFx0bGV0IHBhc3N3b3JkRGlnZXN0ID0gYXdhaXQgY3J5cHRvLnN1YnRsZS5kaWdlc3QoeyBuYW1lOiAnU0hBLTI1NicgfSwgcGFzc3dvcmRCeXRlcyk7XHJcblxyXG5cdFx0bGV0IGtleSA9IGF3YWl0IGNyeXB0by5zdWJ0bGUuaW1wb3J0S2V5KFxyXG5cdFx0XHQncmF3JyxcclxuXHRcdFx0cGFzc3dvcmREaWdlc3QsXHJcblx0XHRcdGFsZ29yaXRobU9ic29sZXRlLFxyXG5cdFx0XHRmYWxzZSxcclxuXHRcdFx0WydlbmNyeXB0JywgJ2RlY3J5cHQnXVxyXG5cdFx0KTtcclxuXHJcblx0XHRyZXR1cm4ga2V5O1xyXG5cdH1cclxuXHJcblx0cHVibGljIGFzeW5jIGVuY3J5cHRUb0Jhc2U2NCh0ZXh0OiBzdHJpbmcsIHBhc3N3b3JkOiBzdHJpbmcpOiBQcm9taXNlPHN0cmluZz4ge1xyXG5cdFx0bGV0IGtleSA9IGF3YWl0IHRoaXMuYnVpbGRLZXkocGFzc3dvcmQpO1xyXG5cclxuXHRcdGxldCB1dGY4RW5jb2RlID0gbmV3IFRleHRFbmNvZGVyKCk7XHJcblx0XHRsZXQgYnl0ZXNUb0VuY3J5cHQgPSB1dGY4RW5jb2RlLmVuY29kZSh0ZXh0KTtcclxuXHJcblx0XHQvLyBlbmNyeXB0IGludG8gYnl0ZXNcclxuXHRcdGxldCBlbmNyeXB0ZWRCeXRlcyA9IG5ldyBVaW50OEFycmF5KGF3YWl0IGNyeXB0by5zdWJ0bGUuZW5jcnlwdChcclxuXHRcdFx0YWxnb3JpdGhtT2Jzb2xldGUsIGtleSwgYnl0ZXNUb0VuY3J5cHRcclxuXHRcdCkpO1xyXG5cclxuXHRcdC8vY29udmVydCBhcnJheSB0byBiYXNlNjRcclxuXHRcdGxldCBiYXNlNjRUZXh0ID0gYnRvYShTdHJpbmcuZnJvbUNoYXJDb2RlKC4uLmVuY3J5cHRlZEJ5dGVzKSk7XHJcblxyXG5cdFx0cmV0dXJuIGJhc2U2NFRleHQ7XHJcblx0fVxyXG5cclxuXHRwcml2YXRlIHN0cmluZ1RvQXJyYXkoc3RyOiBzdHJpbmcpOiBVaW50OEFycmF5IHtcclxuXHRcdHZhciByZXN1bHQgPSBbXTtcclxuXHRcdGZvciAodmFyIGkgPSAwOyBpIDwgc3RyLmxlbmd0aDsgaSsrKSB7XHJcblx0XHRcdHJlc3VsdC5wdXNoKHN0ci5jaGFyQ29kZUF0KGkpKTtcclxuXHRcdH1cclxuXHRcdHJldHVybiBuZXcgVWludDhBcnJheShyZXN1bHQpO1xyXG5cdH1cclxuXHJcblx0cHVibGljIGFzeW5jIGRlY3J5cHRGcm9tQmFzZTY0KGJhc2U2NEVuY29kZWQ6IHN0cmluZywgcGFzc3dvcmQ6IHN0cmluZyk6IFByb21pc2U8c3RyaW5nPiB7XHJcblx0XHR0cnkge1xyXG5cdFx0XHQvLyBjb252ZXJ0IGJhc2UgNjQgdG8gYXJyYXlcclxuXHRcdFx0bGV0IGJ5dGVzVG9EZWNyeXB0ID0gdGhpcy5zdHJpbmdUb0FycmF5KGF0b2IoYmFzZTY0RW5jb2RlZCkpO1xyXG5cclxuXHRcdFx0bGV0IGtleSA9IGF3YWl0IHRoaXMuYnVpbGRLZXkocGFzc3dvcmQpO1xyXG5cclxuXHRcdFx0Ly8gZGVjcnlwdCBpbnRvIGJ5dGVzXHJcblx0XHRcdGxldCBkZWNyeXB0ZWRCeXRlcyA9IGF3YWl0IGNyeXB0by5zdWJ0bGUuZGVjcnlwdChhbGdvcml0aG1PYnNvbGV0ZSwga2V5LCBieXRlc1RvRGVjcnlwdCk7XHJcblxyXG5cdFx0XHQvLyBjb252ZXJ0IGJ5dGVzIHRvIHRleHRcclxuXHRcdFx0bGV0IHV0ZjhEZWNvZGUgPSBuZXcgVGV4dERlY29kZXIoKTtcclxuXHRcdFx0bGV0IGRlY3J5cHRlZFRleHQgPSB1dGY4RGVjb2RlLmRlY29kZShkZWNyeXB0ZWRCeXRlcyk7XHJcblx0XHRcdHJldHVybiBkZWNyeXB0ZWRUZXh0O1xyXG5cdFx0fSBjYXRjaCAoZSkge1xyXG5cdFx0XHRyZXR1cm4gbnVsbDtcclxuXHRcdH1cclxuXHR9XHJcblxyXG59XHJcbiIsImltcG9ydCB7IEFwcCwgUGx1Z2luU2V0dGluZ1RhYiwgU2V0dGluZywgU2xpZGVyQ29tcG9uZW50IH0gZnJvbSBcIm9ic2lkaWFuXCI7XHJcbmltcG9ydCBNZWxkRW5jcnlwdCBmcm9tIFwiLi9tYWluXCI7XHJcblxyXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBNZWxkRW5jcnlwdFNldHRpbmdzVGFiIGV4dGVuZHMgUGx1Z2luU2V0dGluZ1RhYiB7XHJcblx0cGx1Z2luOiBNZWxkRW5jcnlwdDtcclxuXHJcblx0cHdUaW1lb3V0U2V0dGluZzpTZXR0aW5nO1xyXG5cclxuXHRjb25zdHJ1Y3RvcihhcHA6IEFwcCwgcGx1Z2luOiBNZWxkRW5jcnlwdCkge1xyXG5cdFx0c3VwZXIoYXBwLCBwbHVnaW4pO1xyXG5cdFx0dGhpcy5wbHVnaW4gPSBwbHVnaW47XHJcblx0fVxyXG5cclxuXHRkaXNwbGF5KCk6IHZvaWQge1xyXG5cdFx0bGV0IHsgY29udGFpbmVyRWwgfSA9IHRoaXM7XHJcblxyXG5cdFx0Y29udGFpbmVyRWwuZW1wdHkoKTtcclxuXHRcdFxyXG5cdFx0Y29udGFpbmVyRWwuY3JlYXRlRWwoJ2gyJywge3RleHQ6ICdTZXR0aW5ncyBmb3IgTWVsZCBFbmNyeXB0J30pO1xyXG5cclxuXHRcdG5ldyBTZXR0aW5nKGNvbnRhaW5lckVsKVxyXG5cdFx0LnNldE5hbWUoJ0NvbmZpcm0gcGFzc3dvcmQ/JylcclxuXHRcdC5zZXREZXNjKCdDb25maXJtIHBhc3N3b3JkIHdoZW4gZW5jcnlwdGluZy4nKVxyXG5cdFx0LmFkZFRvZ2dsZSggdG9nZ2xlID0+e1xyXG5cdFx0XHR0b2dnbGVcclxuXHRcdFx0XHQuc2V0VmFsdWUodGhpcy5wbHVnaW4uc2V0dGluZ3MuY29uZmlybVBhc3N3b3JkKVxyXG5cdFx0XHRcdC5vbkNoYW5nZSggYXN5bmMgdmFsdWUgPT57XHJcblx0XHRcdFx0XHR0aGlzLnBsdWdpbi5zZXR0aW5ncy5jb25maXJtUGFzc3dvcmQgPSB2YWx1ZTtcclxuXHRcdFx0XHRcdGF3YWl0IHRoaXMucGx1Z2luLnNhdmVTZXR0aW5ncygpO1xyXG5cdFx0XHRcdFx0dGhpcy51cGRhdGVTZXR0aW5nc1VpKCk7XHJcblx0XHRcdFx0fSlcclxuXHRcdH0pXHJcblx0O1xyXG5cclxuXHRcdG5ldyBTZXR0aW5nKGNvbnRhaW5lckVsKVxyXG5cdFx0XHQuc2V0TmFtZSgnUmVtZW1iZXIgcGFzc3dvcmQ/JylcclxuXHRcdFx0LnNldERlc2MoJ1JlbWVtYmVyIHRoZSBsYXN0IHVzZWQgcGFzc3dvcmQgZm9yIHRoaXMgc2Vzc2lvbi4nKVxyXG5cdFx0XHQuYWRkVG9nZ2xlKCB0b2dnbGUgPT57XHJcblx0XHRcdFx0dG9nZ2xlXHJcblx0XHRcdFx0XHQuc2V0VmFsdWUodGhpcy5wbHVnaW4uc2V0dGluZ3MucmVtZW1iZXJQYXNzd29yZClcclxuXHRcdFx0XHRcdC5vbkNoYW5nZSggYXN5bmMgdmFsdWUgPT57XHJcblx0XHRcdFx0XHRcdHRoaXMucGx1Z2luLnNldHRpbmdzLnJlbWVtYmVyUGFzc3dvcmQgPSB2YWx1ZTtcclxuXHRcdFx0XHRcdFx0YXdhaXQgdGhpcy5wbHVnaW4uc2F2ZVNldHRpbmdzKCk7XHJcblx0XHRcdFx0XHRcdHRoaXMudXBkYXRlU2V0dGluZ3NVaSgpO1xyXG5cdFx0XHRcdFx0fSlcclxuXHRcdFx0fSlcclxuXHRcdDtcclxuXHJcblx0XHR0aGlzLnB3VGltZW91dFNldHRpbmcgPSBuZXcgU2V0dGluZyhjb250YWluZXJFbClcclxuXHRcdFx0LnNldE5hbWUoIHRoaXMuYnVpbGRQYXNzd29yZFRpbWVvdXRTZXR0aW5nTmFtZSgpIClcclxuXHRcdFx0LnNldERlc2MoJ1RoZSBudW1iZXIgb2YgbWludXRlcyB0byByZW1lbWJlciB0aGUgbGFzdCB1c2VkIHBhc3N3b3JkLicpXHJcblx0XHRcdC5hZGRTbGlkZXIoIHNsaWRlciA9PiB7XHJcblx0XHRcdFx0c2xpZGVyXHJcblx0XHRcdFx0XHQuc2V0TGltaXRzKDAsIDEyMCwgNSlcclxuXHRcdFx0XHRcdC5zZXRWYWx1ZSh0aGlzLnBsdWdpbi5zZXR0aW5ncy5yZW1lbWJlclBhc3N3b3JkVGltZW91dClcclxuXHRcdFx0XHRcdC5vbkNoYW5nZSggYXN5bmMgdmFsdWUgPT4ge1xyXG5cdFx0XHRcdFx0XHR0aGlzLnBsdWdpbi5zZXR0aW5ncy5yZW1lbWJlclBhc3N3b3JkVGltZW91dCA9IHZhbHVlO1xyXG5cdFx0XHRcdFx0XHRhd2FpdCB0aGlzLnBsdWdpbi5zYXZlU2V0dGluZ3MoKTtcclxuXHRcdFx0XHRcdFx0dGhpcy51cGRhdGVTZXR0aW5nc1VpKCk7XHJcblx0XHRcdFx0XHR9KVxyXG5cdFx0XHRcdDtcclxuXHRcdFx0XHRcclxuXHRcdFx0fSlcclxuXHRcdDtcclxuXHJcblx0XHR0aGlzLnVwZGF0ZVNldHRpbmdzVWkoKTtcclxuXHR9XHJcblxyXG5cdHVwZGF0ZVNldHRpbmdzVWkoKTp2b2lke1xyXG5cdFx0dGhpcy5wd1RpbWVvdXRTZXR0aW5nLnNldE5hbWUodGhpcy5idWlsZFBhc3N3b3JkVGltZW91dFNldHRpbmdOYW1lKCkpO1xyXG5cclxuXHRcdGlmICggdGhpcy5wbHVnaW4uc2V0dGluZ3MucmVtZW1iZXJQYXNzd29yZCApe1xyXG5cdFx0XHR0aGlzLnB3VGltZW91dFNldHRpbmcuc2V0dGluZ0VsLnNob3coKTtcclxuXHRcdH1lbHNle1xyXG5cdFx0XHR0aGlzLnB3VGltZW91dFNldHRpbmcuc2V0dGluZ0VsLmhpZGUoKTtcclxuXHRcdH1cclxuXHR9XHJcblxyXG5cdGJ1aWxkUGFzc3dvcmRUaW1lb3V0U2V0dGluZ05hbWUoKTpzdHJpbmd7XHJcblx0XHRjb25zdCB2YWx1ZSA9IHRoaXMucGx1Z2luLnNldHRpbmdzLnJlbWVtYmVyUGFzc3dvcmRUaW1lb3V0O1xyXG5cdFx0bGV0IHRpbWVvdXRTdHJpbmcgPSBgJHt2YWx1ZX0gbWludXRlc2A7XHJcblx0XHRpZih2YWx1ZSA9PSAwKXtcclxuXHRcdFx0dGltZW91dFN0cmluZyA9ICdOZXZlciBmb3JnZXQnO1xyXG5cdFx0fVxyXG5cdFx0cmV0dXJuIGBSZW1lbWJlciBQYXNzd29yZCBUaW1lb3V0ICgke3RpbWVvdXRTdHJpbmd9KWA7XHJcblx0fVxyXG59IiwiaW1wb3J0IHsgTm90aWNlLCBQbHVnaW4sIE1hcmtkb3duVmlldywgRWRpdG9yIH0gZnJvbSAnb2JzaWRpYW4nO1xyXG5pbXBvcnQgRGVjcnlwdE1vZGFsIGZyb20gJy4vRGVjcnlwdE1vZGFsJztcclxuaW1wb3J0IFBhc3N3b3JkTW9kYWwgZnJvbSAnLi9QYXNzd29yZE1vZGFsJztcclxuaW1wb3J0IHsgQ3J5cHRvSGVscGVyVjIsIENyeXB0b0hlbHBlck9ic29sZXRlfSBmcm9tICcuL0NyeXB0b0hlbHBlcic7XHJcbmltcG9ydCBNZWxkRW5jcnlwdFNldHRpbmdzVGFiIGZyb20gJy4vTWVsZEVuY3J5cHRTZXR0aW5nc1RhYic7XHJcblxyXG5jb25zdCBfUFJFRklYX09CU09MRVRFOiBzdHJpbmcgPSAnJSXwn5SQICc7XHJcbmNvbnN0IF9QUkVGSVhfQTogc3RyaW5nID0gJyUl8J+UkM6xICc7XHJcbmNvbnN0IF9TVUZGSVg6IHN0cmluZyA9ICcg8J+UkCUlJztcclxuXHJcbmludGVyZmFjZSBNZWxkRW5jcnlwdFBsdWdpblNldHRpbmdzIHtcclxuXHRjb25maXJtUGFzc3dvcmQ6IGJvb2xlYW47XHJcblx0cmVtZW1iZXJQYXNzd29yZDogYm9vbGVhbjtcclxuXHRyZW1lbWJlclBhc3N3b3JkVGltZW91dDogbnVtYmVyO1xyXG59XHJcblxyXG5jb25zdCBERUZBVUxUX1NFVFRJTkdTOiBNZWxkRW5jcnlwdFBsdWdpblNldHRpbmdzID0ge1xyXG5cdGNvbmZpcm1QYXNzd29yZDogdHJ1ZSxcclxuXHRyZW1lbWJlclBhc3N3b3JkOiB0cnVlLFxyXG5cdHJlbWVtYmVyUGFzc3dvcmRUaW1lb3V0OiAzMFxyXG59XHJcblxyXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBNZWxkRW5jcnlwdCBleHRlbmRzIFBsdWdpbiB7XHJcblxyXG5cdHNldHRpbmdzOiBNZWxkRW5jcnlwdFBsdWdpblNldHRpbmdzO1xyXG5cdHBhc3N3b3JkTGFzdFVzZWRFeHBpcnk6IG51bWJlclxyXG5cdHBhc3N3b3JkTGFzdFVzZWQ6IHN0cmluZztcclxuXHJcblx0YXN5bmMgb25sb2FkKCkge1xyXG5cclxuXHRcdGF3YWl0IHRoaXMubG9hZFNldHRpbmdzKCk7XHJcblxyXG5cdFx0dGhpcy5hZGRTZXR0aW5nVGFiKG5ldyBNZWxkRW5jcnlwdFNldHRpbmdzVGFiKHRoaXMuYXBwLCB0aGlzKSk7XHJcblxyXG5cdFx0dGhpcy5hZGRDb21tYW5kKHtcclxuXHRcdFx0aWQ6ICdlbmNyeXB0LWRlY3J5cHQnLFxyXG5cdFx0XHRuYW1lOiAnRW5jcnlwdC9EZWNyeXB0JyxcclxuXHRcdFx0Y2hlY2tDYWxsYmFjazogKGNoZWNraW5nKSA9PiB0aGlzLnByb2Nlc3NFbmNyeXB0RGVjcnlwdENvbW1hbmQoY2hlY2tpbmcsIGZhbHNlKVxyXG5cdFx0fSk7XHJcblxyXG5cdFx0dGhpcy5hZGRDb21tYW5kKHtcclxuXHRcdFx0aWQ6ICdlbmNyeXB0LWRlY3J5cHQtaW4tcGxhY2UnLFxyXG5cdFx0XHRuYW1lOiAnRW5jcnlwdC9EZWNyeXB0IEluLXBsYWNlJyxcclxuXHRcdFx0Y2hlY2tDYWxsYmFjazogKGNoZWNraW5nKSA9PiB0aGlzLnByb2Nlc3NFbmNyeXB0RGVjcnlwdENvbW1hbmQoY2hlY2tpbmcsIHRydWUpXHJcblx0XHR9KTtcclxuXHR9XHJcblxyXG5cdGFzeW5jIGxvYWRTZXR0aW5ncygpIHtcclxuXHRcdHRoaXMuc2V0dGluZ3MgPSBPYmplY3QuYXNzaWduKHt9LCBERUZBVUxUX1NFVFRJTkdTLCBhd2FpdCB0aGlzLmxvYWREYXRhKCkpO1xyXG5cdH1cclxuXHJcblx0YXN5bmMgc2F2ZVNldHRpbmdzKCkge1xyXG5cdFx0YXdhaXQgdGhpcy5zYXZlRGF0YSh0aGlzLnNldHRpbmdzKTtcclxuXHR9XHJcblxyXG5cdHByb2Nlc3NFbmNyeXB0RGVjcnlwdENvbW1hbmQoY2hlY2tpbmc6IGJvb2xlYW4sIGRlY3J5cHRJblBsYWNlOiBib29sZWFuKTogYm9vbGVhbiB7XHJcblxyXG5cdFx0aWYgKGNoZWNraW5nICYmIHRoaXMuYXBwLndvcmtzcGFjZS5hY3RpdmVMZWFmKXtcclxuXHRcdFx0Ly8gZW5zdXJlcyB0aGlzIGNvbW1hbmQgY2FuIHNob3cgdXAgaW4gb3RoZXIgcGx1Z2lucyB3aGljaCBsaXN0IGNvbW1hbmRzIGUuZy4gY3VzdG9taXphYmxlLXNpZGViYXJcclxuXHRcdFx0cmV0dXJuIHRydWU7IFxyXG5cdFx0fVxyXG5cclxuXHRcdGNvbnN0IG1kdmlldyA9IHRoaXMuYXBwLndvcmtzcGFjZS5nZXRBY3RpdmVWaWV3T2ZUeXBlKE1hcmtkb3duVmlldyk7XHJcblx0XHRpZiAoIW1kdmlldykge1xyXG5cdFx0XHRyZXR1cm4gZmFsc2U7XHJcblx0XHR9XHJcblxyXG5cdFx0Y29uc3QgZWRpdG9yID0gbWR2aWV3LmVkaXRvcjtcclxuXHRcdGlmICghZWRpdG9yKSB7XHJcblx0XHRcdHJldHVybiBmYWxzZTtcclxuXHRcdH1cclxuXHJcblx0XHRjb25zdCBzdGFydExpbmUgPSBlZGl0b3IuZ2V0Q3Vyc29yKCdmcm9tJykubGluZTtcclxuXHRcdGNvbnN0IHN0YXJ0UG9zID0geyBsaW5lOiBzdGFydExpbmUsIGNoOiAwIH07IC8vIHdhbnQgdGhlIHN0YXJ0IG9mIHRoZSBmaXJzdCBsaW5lXHJcblxyXG5cdFx0Y29uc3QgZW5kTGluZSA9IGVkaXRvci5nZXRDdXJzb3IoJ3RvJykubGluZTtcclxuXHRcdGNvbnN0IGVuZExpbmVUZXh0ID0gZWRpdG9yLmdldExpbmUoZW5kTGluZSk7XHJcblx0XHRjb25zdCBlbmRQb3MgPSB7IGxpbmU6IGVuZExpbmUsIGNoOiBlbmRMaW5lVGV4dC5sZW5ndGggfTsgLy8gd2FudCB0aGUgZW5kIG9mIGxhc3QgbGluZVxyXG5cclxuXHRcdGNvbnN0IHNlbGVjdGlvblRleHQgPSBlZGl0b3IuZ2V0UmFuZ2Uoc3RhcnRQb3MsIGVuZFBvcyk7XHJcblxyXG5cdFx0aWYgKHNlbGVjdGlvblRleHQubGVuZ3RoID09IDApIHtcclxuXHRcdFx0cmV0dXJuIGZhbHNlO1xyXG5cdFx0fVxyXG5cclxuXHRcdGNvbnN0IGRlY3J5cHRfb2JzID0gc2VsZWN0aW9uVGV4dC5zdGFydHNXaXRoKF9QUkVGSVhfT0JTT0xFVEUpICYmIHNlbGVjdGlvblRleHQuZW5kc1dpdGgoX1NVRkZJWCk7XHJcblx0XHRjb25zdCBkZWNyeXB0X2EgPSBzZWxlY3Rpb25UZXh0LnN0YXJ0c1dpdGgoX1BSRUZJWF9BKSAmJiBzZWxlY3Rpb25UZXh0LmVuZHNXaXRoKF9TVUZGSVgpO1xyXG5cclxuXHRcdGNvbnN0IGRlY3J5cHQgPSBkZWNyeXB0X29icyB8fCBkZWNyeXB0X2E7XHJcblx0XHRjb25zdCBlbmNyeXB0ID0gIXNlbGVjdGlvblRleHQuY29udGFpbnMoX1BSRUZJWF9PQlNPTEVURSkgJiYgIXNlbGVjdGlvblRleHQuY29udGFpbnMoX1NVRkZJWCk7XHJcblxyXG5cdFx0aWYgKCFkZWNyeXB0ICYmICFlbmNyeXB0KSB7XHJcblx0XHRcdHJldHVybiBmYWxzZTtcclxuXHRcdH1cclxuXHJcblx0XHRpZiAoY2hlY2tpbmcpIHtcclxuXHRcdFx0cmV0dXJuIHRydWU7XHJcblx0XHR9XHJcblxyXG5cdFx0Ly8gRmV0Y2ggcGFzc3dvcmQgZnJvbSB1c2VyXHJcblxyXG5cdFx0Ly8gZGV0ZXJtaW5lIGRlZmF1bHQgcGFzc3dvcmRcclxuXHRcdGNvbnN0IGlzUmVtZW1iZXJQYXNzd29yZEV4cGlyZWQgPVxyXG5cdFx0XHQhdGhpcy5zZXR0aW5ncy5yZW1lbWJlclBhc3N3b3JkXHJcblx0XHRcdHx8IChcclxuXHRcdFx0XHR0aGlzLnBhc3N3b3JkTGFzdFVzZWRFeHBpcnkgIT0gbnVsbFxyXG5cdFx0XHRcdCYmIERhdGUubm93KCkgPiB0aGlzLnBhc3N3b3JkTGFzdFVzZWRFeHBpcnlcclxuXHRcdFx0KVxyXG5cdFx0XHQ7XHJcblxyXG5cdFx0Y29uc3QgY29uZmlybVBhc3N3b3JkID0gZW5jcnlwdCAmJiB0aGlzLnNldHRpbmdzLmNvbmZpcm1QYXNzd29yZDtcclxuXHJcblx0XHRpZiAoIGlzUmVtZW1iZXJQYXNzd29yZEV4cGlyZWQgfHwgY29uZmlybVBhc3N3b3JkICkge1xyXG5cdFx0XHQvLyBmb3JnZXQgcGFzc3dvcmRcclxuXHRcdFx0dGhpcy5wYXNzd29yZExhc3RVc2VkID0gJyc7XHJcblx0XHR9XHJcblxyXG5cdFx0Y29uc3QgcHdNb2RhbCA9IG5ldyBQYXNzd29yZE1vZGFsKHRoaXMuYXBwLCBjb25maXJtUGFzc3dvcmQsIHRoaXMucGFzc3dvcmRMYXN0VXNlZCk7XHJcblx0XHRwd01vZGFsLm9uQ2xvc2UgPSAoKSA9PiB7XHJcblx0XHRcdGNvbnN0IHB3ID0gcHdNb2RhbC5wYXNzd29yZCA/PyAnJ1xyXG5cdFx0XHRpZiAocHcubGVuZ3RoID09IDApIHtcclxuXHRcdFx0XHRyZXR1cm47XHJcblx0XHRcdH1cclxuXHJcblx0XHRcdC8vIHJlbWVtYmVyIHBhc3N3b3JkP1xyXG5cdFx0XHRpZiAodGhpcy5zZXR0aW5ncy5yZW1lbWJlclBhc3N3b3JkKSB7XHJcblx0XHRcdFx0dGhpcy5wYXNzd29yZExhc3RVc2VkID0gcHc7XHJcblx0XHRcdFx0dGhpcy5wYXNzd29yZExhc3RVc2VkRXhwaXJ5ID1cclxuXHRcdFx0XHRcdHRoaXMuc2V0dGluZ3MucmVtZW1iZXJQYXNzd29yZFRpbWVvdXQgPT0gMFxyXG5cdFx0XHRcdFx0XHQ/IG51bGxcclxuXHRcdFx0XHRcdFx0OiBEYXRlLm5vdygpICsgdGhpcy5zZXR0aW5ncy5yZW1lbWJlclBhc3N3b3JkVGltZW91dCAqIDEwMDAgKiA2MC8vIG5ldyBleHBpcnlcclxuXHRcdFx0XHRcdDtcclxuXHRcdFx0fVxyXG5cclxuXHRcdFx0aWYgKGVuY3J5cHQpIHtcclxuXHRcdFx0XHR0aGlzLmVuY3J5cHRTZWxlY3Rpb24oXHJcblx0XHRcdFx0XHRlZGl0b3IsXHJcblx0XHRcdFx0XHRzZWxlY3Rpb25UZXh0LFxyXG5cdFx0XHRcdFx0cHcsXHJcblx0XHRcdFx0XHRzdGFydFBvcyxcclxuXHRcdFx0XHRcdGVuZFBvc1xyXG5cdFx0XHRcdCk7XHJcblx0XHRcdH0gZWxzZSB7XHJcblxyXG5cdFx0XHRcdGlmIChkZWNyeXB0X2Epe1xyXG5cdFx0XHRcdFx0dGhpcy5kZWNyeXB0U2VsZWN0aW9uX2EoXHJcblx0XHRcdFx0XHRcdGVkaXRvcixcclxuXHRcdFx0XHRcdFx0c2VsZWN0aW9uVGV4dCxcclxuXHRcdFx0XHRcdFx0cHcsXHJcblx0XHRcdFx0XHRcdHN0YXJ0UG9zLFxyXG5cdFx0XHRcdFx0XHRlbmRQb3MsXHJcblx0XHRcdFx0XHRcdGRlY3J5cHRJblBsYWNlXHJcblx0XHRcdFx0XHQpO1xyXG5cdFx0XHRcdH1lbHNle1xyXG5cdFx0XHRcdFx0dGhpcy5kZWNyeXB0U2VsZWN0aW9uT2Jzb2xldGUoXHJcblx0XHRcdFx0XHRcdGVkaXRvcixcclxuXHRcdFx0XHRcdFx0c2VsZWN0aW9uVGV4dCxcclxuXHRcdFx0XHRcdFx0cHcsXHJcblx0XHRcdFx0XHRcdHN0YXJ0UG9zLFxyXG5cdFx0XHRcdFx0XHRlbmRQb3MsXHJcblx0XHRcdFx0XHRcdGRlY3J5cHRJblBsYWNlXHJcblx0XHRcdFx0XHQpO1xyXG5cdFx0XHRcdH1cclxuXHRcdFx0fVxyXG5cdFx0fVxyXG5cdFx0cHdNb2RhbC5vcGVuKCk7XHJcblxyXG5cdFx0cmV0dXJuIHRydWU7XHJcblx0fVxyXG5cclxuXHRwcml2YXRlIGFzeW5jIGVuY3J5cHRTZWxlY3Rpb24oXHJcblx0XHRlZGl0b3I6IEVkaXRvcixcclxuXHRcdHNlbGVjdGlvblRleHQ6IHN0cmluZyxcclxuXHRcdHBhc3N3b3JkOiBzdHJpbmcsXHJcblx0XHRmaW5hbFNlbGVjdGlvblN0YXJ0OiBDb2RlTWlycm9yLlBvc2l0aW9uLFxyXG5cdFx0ZmluYWxTZWxlY3Rpb25FbmQ6IENvZGVNaXJyb3IuUG9zaXRpb24sXHJcblx0KSB7XHJcblx0XHQvL2VuY3J5cHRcclxuXHRcdGNvbnN0IGNyeXB0byA9IG5ldyBDcnlwdG9IZWxwZXJWMigpO1xyXG5cdFx0Y29uc3QgYmFzZTY0RW5jcnlwdGVkVGV4dCA9IHRoaXMuYWRkTWFya2Vycyhhd2FpdCBjcnlwdG8uZW5jcnlwdFRvQmFzZTY0KHNlbGVjdGlvblRleHQsIHBhc3N3b3JkKSk7XHJcblx0XHRlZGl0b3Iuc2V0U2VsZWN0aW9uKGZpbmFsU2VsZWN0aW9uU3RhcnQsIGZpbmFsU2VsZWN0aW9uRW5kKTtcclxuXHRcdGVkaXRvci5yZXBsYWNlU2VsZWN0aW9uKGJhc2U2NEVuY3J5cHRlZFRleHQpO1xyXG5cdH1cclxuXHJcblx0cHJpdmF0ZSBhc3luYyBkZWNyeXB0U2VsZWN0aW9uX2EoXHJcblx0XHRlZGl0b3I6IEVkaXRvcixcclxuXHRcdHNlbGVjdGlvblRleHQ6IHN0cmluZyxcclxuXHRcdHBhc3N3b3JkOiBzdHJpbmcsXHJcblx0XHRzZWxlY3Rpb25TdGFydDogQ29kZU1pcnJvci5Qb3NpdGlvbixcclxuXHRcdHNlbGVjdGlvbkVuZDogQ29kZU1pcnJvci5Qb3NpdGlvbixcclxuXHRcdGRlY3J5cHRJblBsYWNlOiBib29sZWFuXHJcblx0KSB7XHJcblx0XHQvL2NvbnNvbGUubG9nKCdkZWNyeXB0U2VsZWN0aW9uX2EnKTtcclxuXHRcdC8vIGRlY3J5cHRcclxuXHRcdGNvbnN0IGJhc2U2NENpcGhlclRleHQgPSB0aGlzLnJlbW92ZU1hcmtlcnMoc2VsZWN0aW9uVGV4dCk7XHJcblxyXG5cdFx0Y29uc3QgY3J5cHRvID0gbmV3IENyeXB0b0hlbHBlclYyKCk7XHJcblx0XHRjb25zdCBkZWNyeXB0ZWRUZXh0ID0gYXdhaXQgY3J5cHRvLmRlY3J5cHRGcm9tQmFzZTY0KGJhc2U2NENpcGhlclRleHQsIHBhc3N3b3JkKTtcclxuXHRcdGlmIChkZWNyeXB0ZWRUZXh0ID09PSBudWxsKSB7XHJcblx0XHRcdG5ldyBOb3RpY2UoJ+KdjCBEZWNyeXB0aW9uIGZhaWxlZCEnKTtcclxuXHRcdH0gZWxzZSB7XHJcblxyXG5cdFx0XHRpZiAoZGVjcnlwdEluUGxhY2UpIHtcclxuXHRcdFx0XHRlZGl0b3Iuc2V0U2VsZWN0aW9uKHNlbGVjdGlvblN0YXJ0LCBzZWxlY3Rpb25FbmQpO1xyXG5cdFx0XHRcdGVkaXRvci5yZXBsYWNlU2VsZWN0aW9uKGRlY3J5cHRlZFRleHQpO1xyXG5cdFx0XHR9IGVsc2Uge1xyXG5cdFx0XHRcdGNvbnN0IGRlY3J5cHRNb2RhbCA9IG5ldyBEZWNyeXB0TW9kYWwodGhpcy5hcHAsICfwn5STJywgZGVjcnlwdGVkVGV4dCk7XHJcblx0XHRcdFx0ZGVjcnlwdE1vZGFsLm9uQ2xvc2UgPSAoKSA9PiB7XHJcblx0XHRcdFx0XHRlZGl0b3IuZm9jdXMoKTtcclxuXHRcdFx0XHRcdGlmIChkZWNyeXB0TW9kYWwuZGVjcnlwdEluUGxhY2UpIHtcclxuXHRcdFx0XHRcdFx0ZWRpdG9yLnNldFNlbGVjdGlvbihzZWxlY3Rpb25TdGFydCwgc2VsZWN0aW9uRW5kKTtcclxuXHRcdFx0XHRcdFx0ZWRpdG9yLnJlcGxhY2VTZWxlY3Rpb24oZGVjcnlwdGVkVGV4dCk7XHJcblx0XHRcdFx0XHR9XHJcblx0XHRcdFx0fVxyXG5cdFx0XHRcdGRlY3J5cHRNb2RhbC5vcGVuKCk7XHJcblx0XHRcdH1cclxuXHRcdH1cclxuXHR9XHJcblxyXG5cdHByaXZhdGUgYXN5bmMgZGVjcnlwdFNlbGVjdGlvbk9ic29sZXRlKFxyXG5cdFx0ZWRpdG9yOiBFZGl0b3IsXHJcblx0XHRzZWxlY3Rpb25UZXh0OiBzdHJpbmcsXHJcblx0XHRwYXNzd29yZDogc3RyaW5nLFxyXG5cdFx0c2VsZWN0aW9uU3RhcnQ6IENvZGVNaXJyb3IuUG9zaXRpb24sXHJcblx0XHRzZWxlY3Rpb25FbmQ6IENvZGVNaXJyb3IuUG9zaXRpb24sXHJcblx0XHRkZWNyeXB0SW5QbGFjZTogYm9vbGVhblxyXG5cdCkge1xyXG5cdFx0Ly9jb25zb2xlLmxvZygnZGVjcnlwdFNlbGVjdGlvbk9ic29sZXRlJyk7XHJcblx0XHQvLyBkZWNyeXB0XHJcblx0XHRjb25zdCBiYXNlNjRDaXBoZXJUZXh0ID0gdGhpcy5yZW1vdmVNYXJrZXJzKHNlbGVjdGlvblRleHQpO1xyXG5cdFx0Y29uc3QgY3J5cHRvID0gbmV3IENyeXB0b0hlbHBlck9ic29sZXRlKCk7XHJcblx0XHRjb25zdCBkZWNyeXB0ZWRUZXh0ID0gYXdhaXQgY3J5cHRvLmRlY3J5cHRGcm9tQmFzZTY0KGJhc2U2NENpcGhlclRleHQsIHBhc3N3b3JkKTtcclxuXHRcdGlmIChkZWNyeXB0ZWRUZXh0ID09PSBudWxsKSB7XHJcblx0XHRcdG5ldyBOb3RpY2UoJ+KdjCBEZWNyeXB0aW9uIGZhaWxlZCEnKTtcclxuXHRcdH0gZWxzZSB7XHJcblxyXG5cdFx0XHRpZiAoZGVjcnlwdEluUGxhY2UpIHtcclxuXHRcdFx0XHRlZGl0b3Iuc2V0U2VsZWN0aW9uKHNlbGVjdGlvblN0YXJ0LCBzZWxlY3Rpb25FbmQpO1xyXG5cdFx0XHRcdGVkaXRvci5yZXBsYWNlU2VsZWN0aW9uKGRlY3J5cHRlZFRleHQpO1xyXG5cdFx0XHR9IGVsc2Uge1xyXG5cdFx0XHRcdGNvbnN0IGRlY3J5cHRNb2RhbCA9IG5ldyBEZWNyeXB0TW9kYWwodGhpcy5hcHAsICfwn5STJywgZGVjcnlwdGVkVGV4dCk7XHJcblx0XHRcdFx0ZGVjcnlwdE1vZGFsLm9uQ2xvc2UgPSAoKSA9PiB7XHJcblx0XHRcdFx0XHRlZGl0b3IuZm9jdXMoKTtcclxuXHRcdFx0XHRcdGlmIChkZWNyeXB0TW9kYWwuZGVjcnlwdEluUGxhY2UpIHtcclxuXHRcdFx0XHRcdFx0ZWRpdG9yLnNldFNlbGVjdGlvbihzZWxlY3Rpb25TdGFydCwgc2VsZWN0aW9uRW5kKTtcclxuXHRcdFx0XHRcdFx0ZWRpdG9yLnJlcGxhY2VTZWxlY3Rpb24oZGVjcnlwdGVkVGV4dCk7XHJcblx0XHRcdFx0XHR9XHJcblx0XHRcdFx0fVxyXG5cdFx0XHRcdGRlY3J5cHRNb2RhbC5vcGVuKCk7XHJcblx0XHRcdH1cclxuXHRcdH1cclxuXHR9XHJcblxyXG5cdHByaXZhdGUgcmVtb3ZlTWFya2Vycyh0ZXh0OiBzdHJpbmcpOiBzdHJpbmcge1xyXG5cdFx0aWYgKHRleHQuc3RhcnRzV2l0aChfUFJFRklYX0EpICYmIHRleHQuZW5kc1dpdGgoX1NVRkZJWCkpIHtcclxuXHRcdFx0cmV0dXJuIHRleHQucmVwbGFjZShfUFJFRklYX0EsICcnKS5yZXBsYWNlKF9TVUZGSVgsICcnKTtcclxuXHRcdH1cclxuXHRcdGlmICh0ZXh0LnN0YXJ0c1dpdGgoX1BSRUZJWF9PQlNPTEVURSkgJiYgdGV4dC5lbmRzV2l0aChfU1VGRklYKSkge1xyXG5cdFx0XHRyZXR1cm4gdGV4dC5yZXBsYWNlKF9QUkVGSVhfT0JTT0xFVEUsICcnKS5yZXBsYWNlKF9TVUZGSVgsICcnKTtcclxuXHRcdH1cclxuXHRcdHJldHVybiB0ZXh0O1xyXG5cdH1cclxuXHJcblx0cHJpdmF0ZSBhZGRNYXJrZXJzKHRleHQ6IHN0cmluZyk6IHN0cmluZyB7XHJcblx0XHRpZiAoIXRleHQuY29udGFpbnMoX1BSRUZJWF9PQlNPTEVURSkgJiYgIXRleHQuY29udGFpbnMoX1BSRUZJWF9BKSAmJiAhdGV4dC5jb250YWlucyhfU1VGRklYKSkge1xyXG5cdFx0XHRyZXR1cm4gX1BSRUZJWF9BLmNvbmNhdCh0ZXh0LCBfU1VGRklYKTtcclxuXHRcdH1cclxuXHRcdHJldHVybiB0ZXh0O1xyXG5cdH1cclxuXHJcbn1cclxuIl0sIm5hbWVzIjpbIk1vZGFsIiwiUGx1Z2luU2V0dGluZ1RhYiIsIlNldHRpbmciLCJQbHVnaW4iLCJNYXJrZG93blZpZXciLCJOb3RpY2UiXSwibWFwcGluZ3MiOiI7Ozs7QUFBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBdURBO0FBQ08sU0FBUyxTQUFTLENBQUMsT0FBTyxFQUFFLFVBQVUsRUFBRSxDQUFDLEVBQUUsU0FBUyxFQUFFO0FBQzdELElBQUksU0FBUyxLQUFLLENBQUMsS0FBSyxFQUFFLEVBQUUsT0FBTyxLQUFLLFlBQVksQ0FBQyxHQUFHLEtBQUssR0FBRyxJQUFJLENBQUMsQ0FBQyxVQUFVLE9BQU8sRUFBRSxFQUFFLE9BQU8sQ0FBQyxLQUFLLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFO0FBQ2hILElBQUksT0FBTyxLQUFLLENBQUMsS0FBSyxDQUFDLEdBQUcsT0FBTyxDQUFDLEVBQUUsVUFBVSxPQUFPLEVBQUUsTUFBTSxFQUFFO0FBQy9ELFFBQVEsU0FBUyxTQUFTLENBQUMsS0FBSyxFQUFFLEVBQUUsSUFBSSxFQUFFLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLE9BQU8sQ0FBQyxFQUFFLEVBQUUsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsRUFBRTtBQUNuRyxRQUFRLFNBQVMsUUFBUSxDQUFDLEtBQUssRUFBRSxFQUFFLElBQUksRUFBRSxJQUFJLENBQUMsU0FBUyxDQUFDLE9BQU8sQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLE9BQU8sQ0FBQyxFQUFFLEVBQUUsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsRUFBRTtBQUN0RyxRQUFRLFNBQVMsSUFBSSxDQUFDLE1BQU0sRUFBRSxFQUFFLE1BQU0sQ0FBQyxJQUFJLEdBQUcsT0FBTyxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsR0FBRyxLQUFLLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxDQUFDLElBQUksQ0FBQyxTQUFTLEVBQUUsUUFBUSxDQUFDLENBQUMsRUFBRTtBQUN0SCxRQUFRLElBQUksQ0FBQyxDQUFDLFNBQVMsR0FBRyxTQUFTLENBQUMsS0FBSyxDQUFDLE9BQU8sRUFBRSxVQUFVLElBQUksRUFBRSxDQUFDLEVBQUUsSUFBSSxFQUFFLENBQUMsQ0FBQztBQUM5RSxLQUFLLENBQUMsQ0FBQztBQUNQOztNQzNFcUIs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
